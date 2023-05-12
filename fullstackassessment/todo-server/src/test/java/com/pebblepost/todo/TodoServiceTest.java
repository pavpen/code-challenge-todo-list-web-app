package com.pebblepost.todo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import java.util.HashMap;
import java.util.Map;
import javax.validation.ConstraintViolationException;
import javassist.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class TodoServiceTest {
    @Autowired
    private TodoRepository todoRepository;

    private TodoService todoService;

    @BeforeEach
    public void setup() {
        todoService = new TodoService(todoRepository);
    }

    @Test
    void createTodo_generatesAnId() {
        Todo result = todoService.createTodo(new Todo("Do 1"));

        assertNotNull(result.getId());
        assertEquals("Do 1", result.getDescription());
        assertEquals(false, result.getCompleted());
    }

    @Test
    void createTodo_acceptsEmptyDescription() {
        // Business requirements can clarify whether creating a to-do item
        // with an empty descriptions should be allowed. Since we don't
        // have access to clarify this at present, we allow such items.
        Todo result = todoService.createTodo(new Todo("", true));

        assertNotNull(result.getId());
        assertEquals("", result.getDescription());
        assertEquals(true, result.getCompleted());
    }

    /**
     * @see #createTodo_acceptsEmptyDescription()
     */
    @Test
    void createTodo_acceptsUnspecifiedDescription() {
        Todo result = todoService.createTodo(new Todo());

        assertNotNull(result.getId());
        assertEquals("", result.getDescription());
    }

    @Test
    void createTodo_ignoresId() {
        // Try to create 2 to-do items with the same ID, and make sure we
        // get 2 items.
        Todo result1 = todoService.createTodo(new Todo("Do 1"));
        Long id1 = result1.getId();
        Todo result2 = todoService.createTodo(Todo.builder()
                .setId(id1)
                .setDescription("Do 2")
                .setCompleted(true)
                .build());

        assertNotNull(id1);
        assertNotNull(result1.getId());
        assertEquals("Do 1", result1.getDescription());
        assertEquals(false, result1.getCompleted());
        assertNotNull(result2.getId());
        assertEquals("Do 2", result2.getDescription());
        assertEquals(true, result2.getCompleted());
    }

    @Test
    void createTodo_failsOnDescriptionBeyondMaxSize() {
        assertThrows(
                ConstraintViolationException.class,
                () -> todoService.createTodo(
                        new Todo("a".repeat(Todo.MAX_DESCRIPTION_LENGTH_CH + 1))));
    }

    @Test
    void getTodos_worksOnEmptyDataStore() {
        assertTrue(todoService.getTodos().isEmpty());
    }

    @Test
    void getTodos_returnsItems() {
        todoService.createTodo(new Todo("Do 1"));
        todoService.createTodo(new Todo("Do 2", true));
        todoService.createTodo(new Todo("Do 3", false));

        Map<String, Todo> expectedItems = new HashMap<String, Todo>();

        expectedItems.put("Do 1", new Todo("Do 1", false));
        expectedItems.put("Do 2", new Todo("Do 2", true));
        expectedItems.put("Do 3", new Todo("Do 3", false));

        for (Todo item : todoService.getTodos()) {
            Todo expectedItem = expectedItems.get(item.getDescription());

            if (expectedItem != null) {
                assertEquals(expectedItem.getCompleted(), item.getCompleted(),
                        String.format(
                                "Unexpected `item.completed` value for item with description: %s",
                                expectedItem.getDescription()));
                expectedItems.remove(item.getDescription());
            } else {
                fail(String.format("Unexpected item description: %s, item: %s",
                        item.getDescription(), item));
            }
        }

        if (!expectedItems.isEmpty()) {
            fail(String.format("Expected items with the following descriptions not found: %s",
                    String.join(", ", expectedItems.keySet())));
        }
    }

    @Test
    void getTodo_returnsAnItem() throws Exception {
        Todo testTodo = todoService.createTodo(new Todo("Do thing 1", true));
        Long id = testTodo.getId();

        Todo result = todoService.getTodo(id);

        assertNotNull(id);
        assertEquals("Do thing 1", result.getDescription());
        assertEquals(true, result.getCompleted());
    }

    @Test
    void getTodo_throwsOnNonExistentId() {
        assertThrows(NotFoundException.class, () -> System.out.println(todoService.getTodo(1L)));
    }

    @Test
    void updateTodo_createsAnEntityForNonExistentId() throws Exception {
        Todo result = todoService.updateTodo(7L, new Todo("Do 1", true));

        // The ID may change when creating a new entity:
        assertNotNull(result.getId());
        assertEquals("Do 1", result.getDescription());
        assertEquals(true, result.getCompleted());
        assertEquals(result, todoService.getTodo(result.getId()));
    }

    @Test
    void updateTodo_updatesDescription() throws Exception {
        Todo initial = todoService.createTodo(new Todo("Do thing", false));
        Long id = initial.getId();

        Todo result = todoService.updateTodo(initial.getId(), new Todo("Do the other thing", false));

        assertEquals(id, result.getId());
        assertEquals("Do the other thing", result.getDescription());
        assertEquals(false, result.getCompleted());
        assertEquals(result, todoService.getTodo(id));
    }

    @Test
    void updateTodo_updatesCompleted() throws Exception {
        Todo initial = todoService.createTodo(new Todo("Do 1", false));
        Long id = initial.getId();

        Todo result = todoService.updateTodo(initial.getId(), new Todo("Do 2", true));

        assertEquals(id, result.getId());
        assertEquals("Do 2", result.getDescription());
        assertEquals(true, result.getCompleted());
        assertEquals(result, todoService.getTodo(id));
    }

    @Test
    void deleteTodo_throwsOnNonExistentId() {
        assertThrows(NotFoundException.class, () -> todoService.deleteTodo(13L));
    }

    @Test
    void deleteTodo_deletesAnItem() throws Exception {
        Todo testTodo = todoService.createTodo(new Todo("The thing to do"));
        Long id = testTodo.getId();

        todoService.deleteTodo(id);

        assertNotNull(id);
        assertEquals(id, testTodo.getId());
        assertThrows(NotFoundException.class, () -> todoService.getTodo(id));
    }
}
