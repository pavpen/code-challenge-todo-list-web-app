import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { TodoListState, listStateReducer } from './TodoComponent';
import { FetchItemsAction, CreateItemAction, DeleteItemAction, UpdateItemAction, SetItemFilterAction, TodoFilterType } from './TodoView';
import { TodoItem } from './TodoList';
import { allMockMethodsOfInstance } from './test/MethodCollectionSubject';
import { TodoComponent } from './TodoComponent';


/**
 * Doesn't implement updated state, but implements request methods.
 */
class MockTodoService {
    /** Item ID to assign when creating a new to-do item. */
    public nextItemId = 19;

    /** Items to return from {@link getAll} */
    public items: Array<TodoItem> = [];

    create = jest.fn(async (newItem: Omit<TodoItem, 'id'>) => {
        return { ...newItem, id: this.nextItemId++ };
    });
    update = jest.fn(async (newItem: TodoItem) => {
        return newItem;
    });
    deleteById = jest.fn(async (itemId: number) => {
        return new Response();
    });
    getAll = jest.fn(async () => this.items);
}

describe('listStateReducer', () => {
    describe('CreateItemAction', () => {
        test('updates state', async () => {
            const initialState: TodoListState = {
                items: [],
                filterType: TodoFilterType.Active,
                filteredItems: [],
            };

            const result = listStateReducer(
                initialState,
                new CreateItemAction({ id: 7, description: 'Do thing 1', completed: false }))

            expect(result).toEqual({
                items: [{ id: 7, description: 'Do thing 1', completed: false }],
                filterType: TodoFilterType.Active,
                filteredItems: [{ id: 7, description: 'Do thing 1', completed: false }],
            });
        });
    });
    describe('UpdateItemAction', () => {
        test('updates state', async () => {
            const initialState: TodoListState = {
                items: [{ id: 8, description: 'The thing', completed: true }],
                filterType: TodoFilterType.All,
                filteredItems: [{ id: 8, description: 'The thing', completed: true }],
            };

            const result = listStateReducer(
                initialState,
                new UpdateItemAction({ id: 8, description: 'The new thing', completed: false }))

            expect(result).toEqual({
                items: [{ id: 8, description: 'The new thing', completed: false }],
                filterType: TodoFilterType.All,
                filteredItems: [{ id: 8, description: 'The new thing', completed: false }],
            });
        });
        test('ignores updates for items with unknown ID', async () => {
            const initialState: TodoListState = {
                items: [{ id: 7, description: 'The thing', completed: true }],
                filterType: TodoFilterType.All,
                filteredItems: [{ id: 7, description: 'The thing', completed: true }],
            };

            const result = listStateReducer(
                initialState,
                new UpdateItemAction({ id: 188, description: 'The new thing', completed: false }));

            expect(result).toEqual({
                items: [{ id: 7, description: 'The thing', completed: true }],
                filterType: TodoFilterType.All,
                filteredItems: [{ id: 7, description: 'The thing', completed: true }],
            });
        });
    });
    describe('DeleteItemAction', () => {
        test('updates state', async () => {
            const initialState: TodoListState = {
                items: [{ id: 17, description: 'Do it', completed: false }],
                filterType: TodoFilterType.All,
                filteredItems: [],
            };

            const result = listStateReducer(initialState, new DeleteItemAction(17));

            expect(result).toEqual({
                items: [],
                filterType: TodoFilterType.All,
                filteredItems: [],
            });
        });
        test('ignores requests for items with unknown ID', async () => {
            const initialState: TodoListState = {
                items: [{ id: 7, description: 'The thing', completed: true }],
                filterType: TodoFilterType.All,
                filteredItems: [{ id: 7, description: 'The thing', completed: true }],
            };

            const result = listStateReducer(initialState, new DeleteItemAction(188));

            expect(result).toEqual({
                items: [{ id: 7, description: 'The thing', completed: true }],
                filterType: TodoFilterType.All,
                filteredItems: [{ id: 7, description: 'The thing', completed: true }],
            });
        });
    });
    describe('FetchItemsAction', () => {
        test('populates items', () => {
            const initialState: TodoListState = {
                items: [{ id: 7, description: 'The thing', completed: true }],
                filterType: TodoFilterType.Completed,
                filteredItems: [{ id: 7, description: 'The thing', completed: true }],
            };

            const result = listStateReducer(initialState, new FetchItemsAction([
                { id: 10, description: 'Do 1', completed: false },
                { id: 3, description: 'Do 2', completed: false },
                { id: 14, description: 'Do 3', completed: true },
            ]));

            expect(result.items).toIncludeSameMembers([
                { id: 10, description: 'Do 1', completed: false },
                { id: 3, description: 'Do 2', completed: false },
                { id: 14, description: 'Do 3', completed: true },
            ]);
            expect(result.filterType).toEqual(TodoFilterType.Completed);
            expect(result.filteredItems).toEqual([{ id: 14, description: 'Do 3', completed: true }]);
        });
    });
    describe('SetItemFilterAction', () => {
        test('filters active items', () => {
            const initialState: TodoListState = {
                items: [
                    { id: 10, description: 'Do 1', completed: false },
                    { id: 3, description: 'Do 2', completed: false },
                    { id: 14, description: 'Do 3', completed: true },
                ],
                filterType: TodoFilterType.Completed,
                filteredItems: [],
            };

            const result = listStateReducer(initialState, new SetItemFilterAction(TodoFilterType.Active));

            expect(result.items).toIncludeSameMembers([
                { id: 10, description: 'Do 1', completed: false },
                { id: 3, description: 'Do 2', completed: false },
                { id: 14, description: 'Do 3', completed: true },
            ]);
            expect(result.filterType).toEqual(TodoFilterType.Active);
            expect(result.filteredItems).toIncludeSameMembers([
                { id: 10, description: 'Do 1', completed: false },
                { id: 3, description: 'Do 2', completed: false },
            ]);
        });
        test('filters completed items', () => {
            const initialState: TodoListState = {
                items: [
                    { id: 10, description: 'Do 1', completed: false },
                    { id: 3, description: 'Do 2', completed: false },
                    { id: 14, description: 'Do 3', completed: true },
                ],
                filterType: TodoFilterType.All,
                filteredItems: [],
            };

            const result = listStateReducer(initialState, new SetItemFilterAction(TodoFilterType.Completed));

            expect(result.items).toIncludeSameMembers([
                { id: 10, description: 'Do 1', completed: false },
                { id: 3, description: 'Do 2', completed: false },
                { id: 14, description: 'Do 3', completed: true },
            ]);
            expect(result.filterType).toEqual(TodoFilterType.Completed);
            expect(result.filteredItems).toIncludeSameMembers([
                { id: 14, description: 'Do 3', completed: true },
            ]);
        });
        test('filters all items', () => {
            const initialState: TodoListState = {
                items: [
                    { id: 10, description: 'Do 1', completed: false },
                    { id: 3, description: 'Do 2', completed: false },
                    { id: 14, description: 'Do 3', completed: true },
                ],
                filterType: TodoFilterType.Completed,
                filteredItems: [],
            };

            const result = listStateReducer(initialState, new SetItemFilterAction(TodoFilterType.All));

            expect(result.items).toIncludeSameMembers([
                { id: 10, description: 'Do 1', completed: false },
                { id: 3, description: 'Do 2', completed: false },
                { id: 14, description: 'Do 3', completed: true },
            ]);
            expect(result.filterType).toEqual(TodoFilterType.All);
            expect(result.filteredItems).toIncludeSameMembers([
                { id: 10, description: 'Do 1', completed: false },
                { id: 3, description: 'Do 2', completed: false },
                { id: 14, description: 'Do 3', completed: true },
            ]);
        });
    });
});

describe('<TodoComponent>', () => {
    // Helper functions:
    function getCheckboxByDescription(description: string): HTMLInputElement {
        const descriptionElement = screen.getByDisplayValue(description);
        const checkboxId = descriptionElement.closest('label')?.htmlFor as string;

        expect(checkboxId).not.toBeNull();

        const checkbox = document.getElementById(checkboxId) as HTMLInputElement;

        expect(checkbox).not.toBeNull();

        return checkbox;
    }

    test('displays buttons, and items from TodoService', async () => {
        const todoService = new MockTodoService();

        todoService.items = [
            { id: 3, description: 'Do 1', completed: true },
            { id: 7, description: 'Do 2', completed: false },
        ];

        await act(async () => {
            render(<TodoComponent todoService={todoService} />);
        });
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Add to-do item')).toBeInTheDocument();
            expect(screen.getByText('All')).toBeInTheDocument();
            expect(screen.getByText('Active')).toBeInTheDocument();
            expect(screen.getByText('Completed')).toBeInTheDocument();
            expect(screen.getByText('1 item left')).toBeInTheDocument();

            expect(getCheckboxByDescription('Do 1')).toHaveAttribute('checked');
            expect(getCheckboxByDescription('Do 2')).not.toHaveAttribute('checked');
        });
    });

    test('creates items', async () => {
        const todoService = new MockTodoService();

        todoService.items = [
            { id: 3, description: 'Do 1', completed: true },
            { id: 7, description: 'Do 2', completed: false },
        ];

        const user = userEvent.setup();

        await act(async () => {
            render(<TodoComponent todoService={todoService} />);
        });
        await waitFor(async () => {
            expect(screen.getByPlaceholderText('Add to-do item')).toBeInTheDocument();
        });

        todoService.nextItemId = 13;

        await user.click(screen.getByPlaceholderText('Add to-do item'));
        await user.keyboard('Do the other thing{Enter}');

        // Wait for the backend to be contacted, and the frontend
        // to update:
        await new Promise(process.nextTick);

        expect(getCheckboxByDescription('Do 1')).toHaveAttribute('checked');
        expect(getCheckboxByDescription('Do 2')).not.toHaveAttribute('checked');
        expect(getCheckboxByDescription('Do the other thing')).not.toHaveAttribute('checked');

        expect(todoService.create).toHaveBeenCalledOnceWith({ description: 'Do the other thing', completed: false });
    });

    test('un-completes items', async () => {
        const todoService = new MockTodoService();

        todoService.items = [
            { id: 3, description: 'Do 1', completed: true },
            { id: 7, description: 'Do 2', completed: false },
        ];

        const user = userEvent.setup();

        await act(async () => {
            render(<TodoComponent todoService={todoService} />);
        });
        await waitFor(async () => {
            expect(screen.getByDisplayValue('Do 1')).toBeInTheDocument();
        });

        expect(getCheckboxByDescription('Do 1')).toHaveAttribute('checked');

        await user.click(getCheckboxByDescription('Do 1'));

        // Wait for the backend to be contacted, and the frontend
        // to update:
        await new Promise(process.nextTick);

        expect(getCheckboxByDescription('Do 1')).not.toHaveAttribute('checked');
        expect(getCheckboxByDescription('Do 2')).not.toHaveAttribute('checked');
        expect(screen.getByText('2 items left')).toBeInTheDocument();

        expect(todoService.update).toHaveBeenCalledOnceWith({ id: 3, description: 'Do 1', completed: false });
    });

    test('completes items', async () => {
        const todoService = new MockTodoService();

        todoService.items = [
            { id: 3, description: 'Do 1', completed: true },
            { id: 7, description: 'Do 2', completed: false },
        ];

        const user = userEvent.setup();

        await act(async () => {
            render(<TodoComponent todoService={todoService} />);
        });
        await waitFor(async () => {
            expect(screen.getByDisplayValue('Do 2')).toBeInTheDocument();
        });

        expect(getCheckboxByDescription('Do 2')).not.toHaveAttribute('checked');

        await user.click(getCheckboxByDescription('Do 2'));

        // Wait for the backend to be contacted, and the frontend
        // to update:
        await new Promise(process.nextTick);

        expect(getCheckboxByDescription('Do 1')).toHaveAttribute('checked');
        expect(getCheckboxByDescription('Do 2')).toHaveAttribute('checked');
        expect(screen.getByText('0 items left')).toBeInTheDocument();

        expect(todoService.update).toHaveBeenCalledOnceWith({ id: 7, description: 'Do 2', completed: true });
    });

    test('edits item description', async () => {
        const todoService = new MockTodoService();

        todoService.items = [
            { id: 3, description: 'Do 1', completed: true },
            { id: 7, description: 'Do 2', completed: false },
        ];

        const user = userEvent.setup();

        await act(async () => {
            render(<TodoComponent todoService={todoService} />);
        });
        await waitFor(async () => {
            expect(screen.getByDisplayValue('Do 2')).toBeInTheDocument();
        });

        await user.dblClick(screen.getByDisplayValue('Do 2').closest('span') as HTMLSpanElement);
        await user.keyboard('{Backspace}the two{Enter}');

        // Wait for the backend to be contacted, and the frontend
        // to update:
        await new Promise(process.nextTick);

        expect(getCheckboxByDescription('Do 1')).toHaveAttribute('checked');
        expect(getCheckboxByDescription('Do the two')).not.toHaveAttribute('checked');

        expect(todoService.update).toHaveBeenLastCalledWith({ id: 7, description: 'Do the two', completed: false });
    });

    test('filters active (not completed) items', async () => {
        const todoService = new MockTodoService();

        todoService.items = [
            { id: 3, description: 'Do 1', completed: true },
            { id: 7, description: 'Do 2', completed: false },
        ];

        const user = userEvent.setup();

        await act(async () => {
            render(<TodoComponent todoService={todoService} />);
        });
        await waitFor(async () => {
            expect(screen.getByDisplayValue('Do 2')).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: 'Active' }));

        expect(screen.queryByDisplayValue('Do 1')).not.toBeInTheDocument();
        expect(getCheckboxByDescription('Do 2')).not.toHaveAttribute('checked');
        expect(screen.getByText('1 item left')).toBeInTheDocument();

        allMockMethodsOfInstance(todoService).except('getAll')
            .forEach(m => expect(m).not.toHaveBeenCalled());
    });

    test('filters completed items', async () => {
        const todoService = new MockTodoService();

        todoService.items = [
            { id: 3, description: 'Do 1', completed: true },
            { id: 7, description: 'Do 2', completed: false },
        ];

        const user = userEvent.setup();

        await act(async () => {
            render(<TodoComponent todoService={todoService} />);
        });
        await waitFor(async () => {
            expect(screen.getByDisplayValue('Do 2')).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: 'Completed' }));

        expect(getCheckboxByDescription('Do 1')).toHaveAttribute('checked');
        expect(screen.queryByDisplayValue('Do 2')).not.toBeInTheDocument();
        expect(screen.getByText('1 item left')).toBeInTheDocument();

        allMockMethodsOfInstance(todoService).except('getAll')
            .forEach(m => expect(m).not.toHaveBeenCalled());
    });

    test('filters all items', async () => {
        const todoService = new MockTodoService();

        todoService.items = [
            { id: 3, description: 'Do 1', completed: true },
            { id: 7, description: 'Do 2', completed: false },
        ];

        const user = userEvent.setup();

        await act(async () => {
            render(<TodoComponent todoService={todoService} />);
        });
        await waitFor(async () => {
            expect(screen.getByDisplayValue('Do 2')).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: 'Completed' }));

        expect(getCheckboxByDescription('Do 1')).toHaveAttribute('checked');
        expect(screen.queryByDisplayValue('Do 2')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'All' }));

        expect(getCheckboxByDescription('Do 1')).toHaveAttribute('checked');
        expect(getCheckboxByDescription('Do 2')).not.toHaveAttribute('checked');
        expect(screen.getByText('1 item left')).toBeInTheDocument();

        allMockMethodsOfInstance(todoService).except('getAll')
            .forEach(m => expect(m).not.toHaveBeenCalled());
    });
});
