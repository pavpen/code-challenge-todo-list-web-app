package com.pebblepost.todo;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import javassist.NotFoundException;

import java.util.List;

@RestController()
@RequestMapping("/todos")
public class TodoController {

    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TodoDto create(@RequestBody TodoDto createDto) {
        return TodoDto.fromEntity(todoService.createTodo(TodoDto.toEntity(createDto)));
    }

    // This may need paging, or we may want to limit the maximum number of items
    // a user can have at any given time.
    @GetMapping
    public List<TodoDto> getAll() {
        return todoService.getTodos().stream().map(TodoDto::fromEntity).toList();
    }

    @GetMapping("/{id}")
    public TodoDto getOne(@PathVariable("id") Long id) {
        Todo result;

        try {
            result = todoService.getTodo(id);
        } catch (NotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    String.format("To-do item with ID %s not found!", id));
        }

        return TodoDto.fromEntity(result);
    }

    @PutMapping("/{id}")
    @ResponseStatus(value = HttpStatus.OK)
    public TodoDto put(@PathVariable("id") Long id, @RequestBody TodoDto updated) {
        return TodoDto.fromEntity(todoService.updateTodo(id, TodoDto.toEntity(updated)));
    }

    @DeleteMapping(value = "/{id}")
    public void delete(@PathVariable("id") Long id) {
        try {
            todoService.deleteTodo(id);
        } catch (NotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    String.format("To-do item with ID %s not found!", id));
        }
    }

}
