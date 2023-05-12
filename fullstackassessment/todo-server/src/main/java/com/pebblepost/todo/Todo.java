package com.pebblepost.todo;

import java.util.Optional;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.validation.constraints.Size;

@Entity
public class Todo {
    /**
     * The maximum allowed length of a to-do item's description in characters.
     * 
     * Unlimited sizes can allow a user to take up aribrary amounts of
     * persistent storage, memory, and, possibly, computation resuorces. To
     * avoid the dangers of possible denial-of-service attacks, we try to use
     * a reasonable limit here.
     */
    public final static int MAX_DESCRIPTION_LENGTH_CH = 1024;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(min = 0, max = MAX_DESCRIPTION_LENGTH_CH)
    private String destription = "";

    private boolean completed = false;

    public Todo() {
    }

    private Todo(Long id, String description, boolean completed) {
        this.id = id;
        this.destription = description;
        this.completed = completed;
    }

    public Todo(String description) {
        this.destription = description;
    }

    public Todo(String description, boolean completed) {
        this.destription = description;
        this.completed = completed;
    }

    public Long getId() {
        return id;
    }

    public String getDescription() {
        return this.destription;
    }

    public boolean getCompleted() {
        return this.completed;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Optional<Long> id = Optional.empty();
        private String description = "";
        private boolean completed = false;

        public Builder id() {
            return this;
        }

        public Builder setId(Long value) {
            this.id = Optional.of(value);

            return this;
        }

        public Builder setNullableId(Long value) {
            this.id = Optional.ofNullable(value);

            return this;
        }

        public Builder setDescription(String value) {
            this.description = value;

            return this;
        }

        public Builder setCompleted(boolean value) {
            this.completed = value;

            return this;
        }

        public Todo build() {
            return id.map(idValue -> new Todo(idValue, description, completed))
                    .orElseGet(() -> new Todo(description, completed));
        }

    }

}
