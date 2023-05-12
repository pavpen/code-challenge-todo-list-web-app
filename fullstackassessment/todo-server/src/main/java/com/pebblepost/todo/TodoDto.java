package com.pebblepost.todo;

public class TodoDto {

    private Long id;

    private String description;

    private boolean completed;

    private TodoDto() {
    }

    private TodoDto(Long id, String description, boolean completed) {
        this.id = id;
        this.description = description;
        this.completed = completed;
    }

    public static TodoDto fromEntity(Todo todo) {
        return TodoDto.builder()
                .setId(todo.getId())
                .setDescription(todo.getDescription())
                .setCompleted(todo.getCompleted())
                .build();
    }

    public static Todo toEntity(TodoDto dto) {
        return Todo.builder()
                .setNullableId(dto.getId())
                .setDescription(dto.getDescription())
                .setCompleted(dto.getCompleted())
                .build();
    }

    private static Builder builder() {
        return new Builder();
    }

    private static class Builder {
        private Long id;
        private String description;
        private boolean completed = false;

        public Builder setId(Long value) {
            this.id = value;

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

        public TodoDto build() {
            return new TodoDto(this.id, this.description, this.completed);
        }

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return this.description;
    }

    public void setDescription(String value) {
        this.description = value;
    }

    public boolean getCompleted() {
        return this.completed;
    }

    public void setCompleted(boolean value) {
        this.completed = value;
    }
}
