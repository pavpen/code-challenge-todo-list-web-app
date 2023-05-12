package com.pebblepost.todo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

public class TodoDtoTest {
    @Test
    void fromEntity_copiesValues() {
        Todo testTodo = Todo.builder()
                .setId(1L)
                .setDescription("Test description")
                .setCompleted(true)
                .build();
        TodoDto result = TodoDto.fromEntity(testTodo);

        assertEquals(1, result.getId());
        assertEquals("Test description", result.getDescription());
        assertEquals(true, result.getCompleted());
    }

    @Test
    void toEntity_copiesValues() {
        TodoDto testDto = TodoDto.fromEntity(
                Todo.builder()
                        .setId(2L)
                        .setDescription("Test to-do item")
                        .setCompleted(true)
                        .build());
        Todo result = TodoDto.toEntity(testDto);

        assertEquals(2, result.getId());
        assertEquals("Test to-do item", result.getDescription());
        assertEquals(true, result.getCompleted());
    }

    @Test
    void toEntity_acceptsNullId() {
        TodoDto testDto = TodoDto.fromEntity(
                Todo.builder()
                        .setDescription("Do thing")
                        .setCompleted(true)
                        .build());
        Todo result = TodoDto.toEntity(testDto);

        assertNull(result.getId());
        assertEquals("Do thing", result.getDescription());
        assertEquals(true, result.getCompleted());
    }

    @Test
    void canDeserializeFromJson() throws Exception {
        String json = "{\"id\":13,\"description\":\"The thing to do\",\"completed\":true}";
        ObjectMapper mapper = new ObjectMapper();

        TodoDto result = mapper.readValue(json, TodoDto.class);

        assertEquals(13, result.getId());
        assertEquals("The thing to do", result.getDescription());
        assertEquals(true, result.getCompleted());
    }

    @Test
    void canSerializeToJson() throws Exception {
        TodoDto testDto = TodoDto.fromEntity(
                Todo.builder()
                        .setId(2L)
                        .setDescription("Test to-do item")
                        .setCompleted(true)
                        .build());
        ObjectMapper mapper = new ObjectMapper();

        String json = mapper.writeValueAsString(testDto);

        System.out.println(String.format("Serialized value:\n%s", json));

        TodoDto result = mapper.readValue(json, TodoDto.class);

        System.out.println(String.format(
                "Deserialized:\n  id: %s,\n  description: %s,\n  completed: %s",
                result.getId(), result.getDescription(), result.getCompleted()));

        assertEquals(2, result.getId());
        assertEquals("Test to-do item", result.getDescription());
        assertEquals(true, result.getCompleted());
    }
}
