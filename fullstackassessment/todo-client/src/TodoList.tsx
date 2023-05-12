import React from 'react';
import './TodoList.css';
import { DeleteItemAction, UpdateItemAction, TodoAction } from './TodoView';
import { TodoService } from './TodoService';

export interface TodoItem {
    id: number,
    description: string,
    completed: boolean,
}

function TodoCheckbox(
    props: React.HTMLProps<HTMLInputElement> & {
        item: TodoItem,
        listStateReducer: React.Dispatch<TodoAction>,
        todoService: TodoService,
    }
) {
    const { item, listStateReducer, todoService, ...restProps } = props;
    const getClassName = (completed: boolean) => completed ? 'todo-item-completed' : 'todo-item-not-completed';

    const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
        const target = event.currentTarget;
        const newIsCompleted = !target.classList.contains('todo-item-completed');

        target.classList.remove('todo-item-completed', 'todo-item-not-completed');
        target.classList.add(getClassName(newIsCompleted));
        if (newIsCompleted) {
            target.setAttribute('checked', '');
        } else {
            target.removeAttribute('checked');
        }

        todoService.update({ ...item, completed: newIsCompleted })
            .then(newItem =>
                listStateReducer(new UpdateItemAction(newItem)));
    };

    return <input {...restProps}
        type='checkbox'
        className={`todo-checkbox ${getClassName(item.completed)}`}
        defaultChecked={item.completed}
        onClick={handleClick} />;
}

function TodoItemDescription(
    props: React.HTMLProps<HTMLInputElement> & {
        item: TodoItem,
        listStateReducer: React.Dispatch<TodoAction>,
        todoService: TodoService,
        htmlFor: string,
        id: string,
    }
) {
    const { item, listStateReducer, todoService, htmlFor, id, ...restProps } = props;
    const className = item.completed ? 'todo-item-completed' : 'todo-item-not-completed';
    const inputRef = React.useRef(null);

    const handleInput = (target: HTMLInputElement) => {
        todoService.update({ ...item, description: target.value })
            .then(newItem => listStateReducer(new UpdateItemAction(newItem)));
        target.readOnly = true;
        target.disabled = true;
    };
    // Handling double click on <input/> didn't seem to work with React for
    // some reason. For now, we wrap it in a <span/>, and handle clicks on
    // the <span/>.
    const handleDoubleClick = (event: React.MouseEvent<HTMLInputElement>) => {
        const target: HTMLInputElement | null = inputRef.current;

        if (target) {
            const t = target as HTMLInputElement;
            t.disabled = false;
            t.readOnly = false;
            t.focus();
        }
    };

    return <label id={id} htmlFor={htmlFor}>
        <span onDoubleClick={handleDoubleClick}>
            <input
                ref={inputRef}
                className={`todo-item-description ${className}`}
                defaultValue={item.description}
                aria-label='To-do item description'
                disabled={restProps.readOnly}
                {...restProps}
                onBlur={(e) => handleInput(e.target)}
                onKeyUp={(e) => e.key === 'Enter' && handleInput(e.currentTarget)}
            />
            <TodoDeleteButton itemId={item.id} listStateReducer={listStateReducer} todoService={todoService} />
        </span>
    </label>;
}

function TodoDeleteButton(props: {
    itemId: number,
    listStateReducer: React.Dispatch<TodoAction>,
    todoService: TodoService,
}) {
    const { itemId, listStateReducer, todoService } = props;

    const handleClick = () => {
        todoService.deleteById(itemId)
            .then(() => listStateReducer(new DeleteItemAction(itemId)));
    };

    return <button type='button' className='todo-delete-button' onClick={handleClick}>🗑️</button>;
}

export function TodoListItem(props: {
    item: TodoItem,
    listStateReducer: React.Dispatch<TodoAction>,
    todoService: TodoService,
}) {
    const { item, listStateReducer, todoService } = props;
    const labelHtmlId = `todo-item-label-${React.useId()}`;
    const descriptionHtmlId = `todo-item-description-${React.useId()}`;

    return <li className='todo-list-item'>
        <TodoCheckbox
            id={descriptionHtmlId}
            aria-labelledby={labelHtmlId}
            item={item}
            listStateReducer={listStateReducer}
            todoService={todoService} />
        <TodoItemDescription
            id={labelHtmlId}
            htmlFor={descriptionHtmlId}
            item={item}
            listStateReducer={listStateReducer}
            todoService={todoService}
            readOnly={true}
        />
    </li>;
}

export function TodoList(props: {
    items: Array<TodoItem>,
    listStateReducer: React.Dispatch<TodoAction>,
    todoService: TodoService,
}) {
    const { items, listStateReducer, todoService } = props;

    return <ul className='todo-list'>
        {items.map(item =>
            <TodoListItem item={item} listStateReducer={listStateReducer} todoService={todoService} key={item.id} />)}
    </ul>;
}