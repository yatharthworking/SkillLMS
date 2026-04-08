package com.soul.lms.model.entity.liveclass;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.soul.lms.commonentity.WhoseColumnsEntity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "TXN_LIVE_CLASSES_PARENT")
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LiveClassEntity extends WhoseColumnsEntity implements Serializable
{
	@Serial
	private static final long serialVersionUID = 1L;
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_live_class_parent")
	@SequenceGenerator(name = "seq_live_class_parent", sequenceName = "seq_live_classes_parent", allocationSize = 1)
	@JsonProperty("liveClassId")
	@Column(name = "live_Class_Id")
	private Long liveClassId;
	
	@JsonProperty("userId")
	@Transient
	private String userName;
	
	@JsonProperty("meetDate")
	@JsonSerialize(using = LocalDateSerializer.class)
	@JsonDeserialize(using = LocalDateDeserializer.class)
	@JsonFormat(shape = JsonFormat.Shape.STRING)
	@Column(name = "meet_date")
	private LocalDate meetDate;

	@JsonManagedReference
	@OneToMany(mappedBy = "liveClassEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
	private List <LiveClassesEntity> liveClassesEntityList = new ArrayList <>();

}
