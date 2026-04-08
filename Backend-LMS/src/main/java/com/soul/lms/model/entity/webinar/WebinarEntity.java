package com.soul.lms.model.entity.webinar;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import javax.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = false)
@Table(name = "webinar_master", indexes = @Index(columnList = "webinar_date"))
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class WebinarEntity extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "webinar_master_info")
    @SequenceGenerator(name = "webinar_master_info", sequenceName = "webinar_master_info",allocationSize = 1)
    @JsonProperty("webinarId")
    @Column(name = "webinar_id")
    private Long webinarId;

    @NotBlank(message = "webinar Date cannot be empty")
    @Temporal(TemporalType.DATE)
    @JsonSerialize(using = LocalDateSerializer.class)
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    @JsonProperty("webinarDate")
    @Column(name = "webinar_date", unique = true,nullable = false, columnDefinition = "date")
    private LocalDate webinarDate;

    //To be used as created by or updated by
    @Transient
    @JsonProperty("userId")
    private Long userId;

    @JsonProperty("isActive")
    @Column(name = "is_active")
    private Boolean isActive;

    @JsonProperty("webinarInfo")
    @JsonManagedReference
    @OneToMany(mappedBy = "webinarEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WebinarInfo> webinarInfoList = new ArrayList<>();
}
