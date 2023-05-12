package com.pebblepost.todo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class TodoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @DirtiesContext
    @Test
    void create_createsAnItem() throws Exception {
        mockMvc.perform(
                post("/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(new Todo("Do it", true)))
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.description").value("Do it"))
                .andExpect(jsonPath("$.completed").value(true));
    }

    @Test
    void getAll_worksOnEmptyDataStore() throws Exception {
        mockMvc.perform(
                get("/todos")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @DirtiesContext
    @Test
    void getAll_returnsItems() throws Exception {
        Todo expected1 = createTodoEntity(new Todo("Do 1"));
        Todo expected2 = createTodoEntity(new Todo("Do 2", true));
        Todo expected3 = createTodoEntity(new Todo("Do 3", false));

        String expectedBody = toJson(Arrays.asList(expected1, expected2, expected3));

        mockMvc.perform(
                get("/todos")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(content().json(expectedBody));
    }

    @Test
    void getOne_returnsNotFound() throws Exception {
        mockMvc.perform(get("/todos/18"))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    @DirtiesContext
    @Test
    void getOne_returnsAnItem() throws Exception {
        createTodoEntity(new Todo("Do 1", false));
        Todo expected = createTodoEntity(new Todo("Do it", true));
        createTodoEntity(new Todo("Do 2"));

        mockMvc.perform(get("/todos/{id}", expected.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().json(toJson(expected)));
    }

    @DirtiesContext
    @Test
    void put_createsAnItem() throws Exception {
        Todo testTodo = new Todo("Do thing", false);
        long nonExistentId = 23;

        String responseBody = mockMvc.perform(
                put("/todos/{id}", nonExistentId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .content(toJson(testTodo)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.description").value("Do thing"))
                .andExpect(jsonPath("$.completed").value(false))
                .andReturn().getResponse().getContentAsString();

        ObjectMapper mapper = new ObjectMapper();
        TodoDto result = mapper.readValue(responseBody, TodoDto.class);
        TodoDto dbEntry = getExistingTodoById(result.getId());

        assertEquals(result.getId(), dbEntry.getId());
        assertEquals(result.getDescription(), dbEntry.getDescription());
        assertEquals(result.getCompleted(), dbEntry.getCompleted());
    }

    @DirtiesContext
    @Test
    void put_updatesAnItem() throws Exception {
        Todo testTodo = createTodoEntity(new Todo("Do something", false));
        long id = testTodo.getId();
        Todo updatedTodo = new Todo("Or not", true);

        mockMvc.perform(
                put("/todos/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .content(toJson(updatedTodo)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.description").value("Or not"))
                .andExpect(jsonPath("$.completed").value(true))
                .andReturn().getResponse().getContentAsString();

        TodoDto dbEntry = getExistingTodoById(id);

        assertEquals(id, dbEntry.getId());
        assertEquals("Or not", dbEntry.getDescription());
        assertEquals(true, dbEntry.getCompleted());

    }

    @Test
    void delete_returnsNotFound() throws Exception {
        long nonExistentId = 44;

        mockMvc.perform(delete("/todos/{id}", nonExistentId))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_deletesAnItem() throws Exception {
        Todo testTodo = createTodoEntity(new Todo("The thing to do", true));
        long id = testTodo.getId();

        mockMvc.perform(delete("/todos/{id}", id))
                .andDo(print())
                .andExpect(status().isOk());

        mockMvc.perform(get("/todos/{id}", id))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    private static String toJson(TodoDto obj) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();

        return mapper.writeValueAsString(obj);
    }

    private static String toJson(Todo entity) throws JsonProcessingException {
        return toJson(TodoDto.fromEntity(entity));
    }

    private static String toJson(List<Todo> entities) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();

        return mapper.writeValueAsString(entities.stream().map(TodoDto::fromEntity).toList());
    }

    private TodoDto createTodo(TodoDto obj) throws Exception {
        String responseJson = mockMvc.perform(
                post("/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(obj))
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.description").value(obj.getDescription()))
                .andExpect(jsonPath("$.completed").value(obj.getCompleted()))
                .andReturn().getResponse().getContentAsString();
        ObjectMapper mapper = new ObjectMapper();

        return mapper.readValue(responseJson, TodoDto.class);
    }

    private TodoDto createTodo(Todo entity) throws Exception {
        return createTodo(TodoDto.fromEntity(entity));
    }

    private Todo createTodoEntity(Todo entity) throws Exception {
        return TodoDto.toEntity(createTodo(entity));
    }

    private TodoDto getExistingTodoById(long id) throws Exception {
        String responseJson = mockMvc.perform(
                get("/todos/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.description").exists())
                .andExpect(jsonPath("$.completed").exists())
                .andReturn().getResponse().getContentAsString();
        ObjectMapper mapper = new ObjectMapper();

        return mapper.readValue(responseJson, TodoDto.class);
    }
}
