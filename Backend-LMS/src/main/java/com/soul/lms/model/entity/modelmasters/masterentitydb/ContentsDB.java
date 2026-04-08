package com.soul.lms.model.entity.modelmasters.masterentitydb;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import com.soul.lms.model.entity.modelmasters.enumentity.Content;
import com.soul.lms.model.entity.studymaterial.ChaptersDB;
import jakarta.persistence.*;
import lombok.*;
import javax.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;

@EqualsAndHashCode(callSuper = false)
@Table(name = "CONTENT_MASTER")
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContentsDB extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "content_master_info")
    @SequenceGenerator(name = "content_master_info", sequenceName = "content_master_info", allocationSize = 1)
    private Long contentId;
    
    
    @JsonProperty("contentType")
    @Column(name = "CONTENT_TYPE", nullable = false)
    @Enumerated(EnumType.STRING)
    private Content contentType;
    
    @JsonProperty("contentName")
    @Column(name = "content_name")
    private String contentName;

    @JsonProperty("isActive")
    @Column(name = "is_active")
    private Boolean isActive;

    @JsonProperty("content")
    @Column(name = "CONTENT", columnDefinition = "bytea")
    private byte[] content;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id")
    private ChaptersDB chaptersDB;
}
