import React from 'react';
import { TodoItem } from './TodoList';
import { TodoView, TodoAction, TodoActionType, FetchItemsAction, TodoFilterType } from './TodoView';
import { TodoService } from './TodoService';

export interface TodoListState {
    items: Array<TodoItem>,
    filterType: TodoFilterType,
    filteredItems: Array<TodoItem>,
}

function getFilteredItems(items: Array<TodoItem>, filterType: TodoFilterType): Array<TodoItem> {
    switch (filterType) {
        case TodoFilterType.All: {
            return items;
        }
        case TodoFilterType.Active: {
            return items.filter(item => !item.completed);
        }
        case TodoFilterType.Completed: {
            return items.filter(item => item.completed);
        }
    }
}

export function listStateReducer(state: TodoListState, action: TodoAction) {
    switch (action.type) {
        case TodoActionType.CreateItem: {
            const items = [action.item, ...state.items];
            return { ...state, items, filteredItems: getFilteredItems(items, state.filterType) };
        }
        case TodoActionType.UpdateItem: {
            const items = state.items.map(item =>
                item.id === action.item.id ? action.item : item
            );
            return { ...state, items, filteredItems: getFilteredItems(items, state.filterType) };
        }
        case TodoActionType.DeleteItem: {
            const items = state.items.filter(item => item.id !== action.id);
            return { ...state, items, filteredItems: getFilteredItems(items, state.filterType) };
        }
        case TodoActionType.FetchItems: {
            return { ...state, items: action.items, filteredItems: getFilteredItems(action.items, state.filterType) };
        }
        case TodoActionType.SetItemFilter: {
            return { ...state, filterType: action.itemFilter, filteredItems: getFilteredItems(state.items, action.itemFilter) }
        }
    }
}

export function TodoComponent(props: { todoService: TodoService }) {
    const { todoService } = props;
    const [listState, reduceListState] = React.useReducer(
        listStateReducer,
        { items: [], filterType: TodoFilterType.All, filteredItems: [] });

    React.useEffect(() => {
        todoService.getAll()
            .then(items => reduceListState(new FetchItemsAction(items)));
    }, [todoService]);

    return <TodoView listState={listState} listStateReducer={reduceListState} todoService={todoService} />;
}