package com.pebblepost.todo;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

public class TodoTest {
    @Test
    void builder_buildsWithIdAndDescription() {
        Todo result = Todo.builder().setId(1L).setDescription("Test description").build();

        assertEquals(1, result.getId());
        assertEquals("Test description", result.getDescription());
        assertEquals(false, result.getCompleted());
    }

    @Test
    void builder_buildsWithoutId() {
        Todo result = Todo.builder().setDescription("Test description").build();

        assertEquals(null, result.getId());
        assertEquals("Test description", result.getDescription());
        assertEquals(false, result.getCompleted());
    }
}
