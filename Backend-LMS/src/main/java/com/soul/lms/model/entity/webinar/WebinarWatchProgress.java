package com.soul.lms.model.entity.webinar;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;

@EqualsAndHashCode(callSuper = false)
@Table(
        name = "webinar_watch_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"webinar_info_id", "username"})
)
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class WebinarWatchProgress extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "webinar_watch_progress_seq")
    @SequenceGenerator(name = "webinar_watch_progress_seq", sequenceName = "webinar_watch_progress_seq", allocationSize = 1)
    @JsonProperty("webinarWatchProgressId")
    @Column(name = "webinar_watch_progress_id")
    private Long webinarWatchProgressId;

    @NotNull(message = "webinar_info_id cannot be null")
    @JsonProperty("webinarInfoId")
    @Column(name = "webinar_info_id", nullable = false)
    private Long webinarInfoId;

    @NotBlank(message = "username cannot be blank")
    @JsonProperty("username")
    @Column(name = "username", nullable = false)
    private String username;

    @JsonProperty("watchedSeconds")
    @Column(name = "watched_seconds")
    private Double watchedSeconds;

    @JsonProperty("totalDurationSeconds")
    @Column(name = "total_duration_seconds")
    private Double totalDurationSeconds;

    @JsonProperty("completed")
    @Column(name = "completed")
    private Boolean completed;
}
