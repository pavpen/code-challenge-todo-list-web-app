import React from 'react';
import { TodoItem, TodoList } from './TodoList';
import './TodoView.css';
import { TodoListState } from './TodoComponent';
import { TodoService } from './TodoService';

export enum TodoFilterType {
    All,
    Active,
    Completed,
}

export enum TodoActionType {
    CreateItem,
    UpdateItem,
    DeleteItem,
    FetchItems,
    SetItemFilter,
}

export class CreateItemAction {
    readonly type = TodoActionType.CreateItem;

    constructor(public readonly item: TodoItem) { }
}

export class UpdateItemAction {
    readonly type = TodoActionType.UpdateItem;

    constructor(
        public readonly item: TodoItem) { }
}

export class DeleteItemAction {
    readonly type = TodoActionType.DeleteItem;

    constructor(public readonly id: number) { }
}

export class FetchItemsAction {
    readonly type = TodoActionType.FetchItems;

    constructor(public readonly items: Array<TodoItem>) { }
}

export class SetItemFilterAction {
    readonly type = TodoActionType.SetItemFilter;

    constructor(public readonly itemFilter: TodoFilterType) { }
}

export type TodoAction =
    CreateItemAction |
    UpdateItemAction |
    DeleteItemAction |
    FetchItemsAction |
    SetItemFilterAction;

export function TodoNewItemBox(
    props: React.HTMLProps<HTMLInputElement> & {
        listStateReducer: React.Dispatch<TodoAction>,
        todoService: TodoService,
    }
) {
    const { listStateReducer, todoService, ...restProps } = props;
    const handleInput = (target: HTMLInputElement) => {
        if (target.value) {
            todoService.create({ description: target.value, completed: false })
                .then(newItem =>
                    listStateReducer(new CreateItemAction(newItem)))
                .catch(error => console.error(error));                    
            target.value = '';
        }
    };

    return <ul className='todo-new-item-container'>
        <li className='todo-new-item-li'>
            <span className='todo-new-item-marker' />
            <input className='todo-new-item-description'
                {...restProps}
                placeholder='Add to-do item'
                onBlur={(e) => handleInput(e.target)}
                onKeyUp={(e) => e.key === 'Enter' && handleInput(e.currentTarget)}
            />
        </li>
    </ul>;
}

export function TodoView(
    props: {
        listState: TodoListState,
        listStateReducer: React.Dispatch<TodoAction>,
        todoService: TodoService,
    }
) {
    const { listState, listStateReducer, todoService } = props;
    const itemLeftCount = listState.items.filter(i => !i.completed).length;

    return <form className='todo-view'>
        <TodoNewItemBox listStateReducer={listStateReducer} todoService={todoService} />
        <TodoList items={listState.filteredItems} listStateReducer={listStateReducer} todoService={todoService} />
        <div className='todo-status-bar'>
            <span className='todo-status-item-left-count'>{itemLeftCount} item{itemLeftCount === 1 ? '' : 's'} left</span>
            <fieldset className='todo-item-filter-group'>
                <button className={`todo-item-filter-option ${listState.filterType === TodoFilterType.All ? 'todo-item-filter-checked' : ''}`}
                    type='button'
                    onClick={() => listStateReducer(new SetItemFilterAction(TodoFilterType.All))}>All</button>
                <button className={`todo-item-filter-option ${listState.filterType === TodoFilterType.Active ? 'todo-item-filter-checked' : ''}`}
                    type='button'
                    onClick={() => listStateReducer(new SetItemFilterAction(TodoFilterType.Active))}>Active</button>
                <button className={`todo-item-filter-option ${listState.filterType === TodoFilterType.Completed ? 'todo-item-filter-checked' : ''}`}
                    type='button'
                    onClick={() => listStateReducer(new SetItemFilterAction(TodoFilterType.Completed))}>Completed</button>
            </fieldset>
        </div>
    </form>;
}