package com.soul.lms.model.entity.announcement;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "TXN_ANNOUNCEMENT_READ")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AnnouncementReadEntity extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_announcement_read")
    @SequenceGenerator(name = "seq_announcement_read", sequenceName = "seq_announcement_read", allocationSize = 1)
    private Long announcementReadId;

    @JsonProperty("announcementId")
    @Column(name = "announcement_id")
    private Long announcementId;

    @JsonProperty("studentId")
    @Column(name = "student_id")
    private Long studentId;

    @JsonProperty("markAsRead")
    @Column(name = "mark_as_read")
    private Boolean markAsRead;

}
