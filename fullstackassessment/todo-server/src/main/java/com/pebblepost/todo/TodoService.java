package com.pebblepost.todo;

import java.util.List;
import javassist.NotFoundException;

import org.hibernate.StaleStateException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;

@Service
public class TodoService {

    private final TodoRepository todoRepository;

    public TodoService(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    Todo createTodo(Todo newTodo) {
        // We don't want this method to overwrite existing Todo items,
        // so we create a copy of the entity without an ID:
        return todoRepository.saveAndFlush(
                new Todo(newTodo.getDescription(), newTodo.getCompleted()));
    }

    public List<Todo> getTodos() {
        return todoRepository.findAll();
    }

    public Todo getTodo(Long id) throws NotFoundException {
        return todoRepository
                .findById(id)
                .orElseThrow(
                        () -> new NotFoundException(
                                String.format("Todo with ID %s not found in repository!", id)));
    }

    public Todo updateTodo(Long id, Todo updatedTodo) {
        return todoRepository.saveAndFlush(Todo.builder()
                .setId(id)
                .setDescription(updatedTodo.getDescription())
                .setCompleted(updatedTodo.getCompleted())
                .build());
    }

    public void deleteTodo(Long id) throws NotFoundException {
        try {
            todoRepository.deleteById(id);
            todoRepository.flush();
        } catch (EmptyResultDataAccessException e) {
            throw new NotFoundException(
                    String.format("Todo with ID %s not found in repository!", id),
                    e);
        } catch (ObjectOptimisticLockingFailureException e) {
            if (StaleStateException.class.equals(e.getCause().getClass())) {
                throw new NotFoundException(
                        String.format("Couldn't delete todo with ID %s! It may have already been deleted.", id),
                        e);
            } else {
                throw (e);
            }
        }
    }

}
