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
@Table(name = "key_takeaways")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@ToString
public class KeyTakeawaysEntity extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "keytakeaways_info")
    @SequenceGenerator(name = "keytakeaways_info", sequenceName = "keytakeaways_info", allocationSize = 1)
    @JsonProperty("keytakeawayId")
    @Column(name = "keytakeaway_id")
    private Long keytakeawayId;

    @JsonProperty("keyTakeaway")
    @Lob
    @Column(name = "keyTakeaway")
    private String keyTakeaway;

    @JsonBackReference
    @JoinColumn(name = "webinar_info_Id")
    @ManyToOne(fetch = FetchType.LAZY)
    private WebinarInfo webinarInfo;
}
