import { TodoItem } from "./TodoList";

const API_URL_PREFIX = window ? `http://localhost:8080/` : '/';
const TODOS_API_URL_PREFIX = `${API_URL_PREFIX}todos/`;

export class TodoService {
    async create(newItem: Omit<TodoItem, 'id'>): Promise<TodoItem> {
        const r = await fetch(
            TODOS_API_URL_PREFIX,
            {
                method: 'POST',
                body: JSON.stringify(newItem),
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
            });
        return await r.json();
    }

    async getAll(): Promise<Array<TodoItem>> {
        const r = await fetch(TODOS_API_URL_PREFIX);
        return await r.json();
    }

    async update(newItem: TodoItem): Promise<TodoItem> {
        const r = await fetch(
            `${TODOS_API_URL_PREFIX}${newItem.id}`,
            {
                method: 'PUT',
                body: JSON.stringify(newItem),
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
            });
        return await r.json();
    }

    deleteById(itemId: number): Promise<Response> {
        return fetch(
            `${TODOS_API_URL_PREFIX}${itemId}`,
            {
                method: 'DELETE',
                body: '',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
            });
    }
}