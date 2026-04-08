package com.soul.lms.model.entity.announcement;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import com.soul.lms.model.entity.modelmasters.masterentitydb.BatchDB;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "TXN_ANNOUNCEMENT_MASTER")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AnnouncementEntity extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_announcement_master")
    @SequenceGenerator(name = "seq_announcement_master", sequenceName = "seq_announcement_master", allocationSize = 1)
    private Long announcementId;

    @JsonProperty("announcementTitle")
    @Column(name = "announcement_title")
    private String announcementTitle;

    @JsonProperty("announcementMessage")
    @Column(name = "announcement_message", columnDefinition = "text")
    private String announcementMessage;

    @JsonProperty("announcementById")
    @Column(name = "announcement_by_id")
    private Long announcementById;

    @JsonProperty("announcementByName")
    @Column(name = "announcement_by_name")
    private String announcementByName;

    @JsonProperty("isActive")
    @Column(name = "is_active")
    private Boolean isActive;

    @Transient
    @JsonProperty("batchId")
    private Long batchId;

    @Transient
    @JsonProperty("batchName")
    private String batchName;

    @Transient
    @JsonProperty("userName")
    private String userName;

    @JsonBackReference
    @JoinColumn(name = "batch_id")
    @ManyToOne(fetch = FetchType.LAZY)
    private BatchDB batchDB;

}
