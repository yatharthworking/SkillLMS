package com.soul.lms.model.entity.webinar;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;


@EqualsAndHashCode(callSuper = true)
@Table(name = "webinar_audience")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@ToString
public class AudienceEntity extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "webinar_audience_info")
    @SequenceGenerator(name = "webinar_audience_info", sequenceName = "webinar_audience_info", allocationSize = 1)
    @JsonProperty("audienceId")
    @Column(name = "audience_id")
    private Long audienceId;

    @JsonProperty("audience")
    @Lob
    @Column(name = "audience")
    private String audience;

    @JsonBackReference
    @JoinColumn(name = "webinar_info_Id")
    @ManyToOne(fetch = FetchType.LAZY)
    private WebinarInfo webinarInfo;
}
