package com.soul.lms.model.entity.liveclass;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import com.soul.lms.commonentity.WhoseColumnsEntity;
//import com.soul.lms.model.entity.modelmasters.masterentitydb.LessonsDB;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "TXN_LIVE_CLASSES_CHILD")
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LiveClassesEntity extends WhoseColumnsEntity implements Serializable
{
	
	@Serial
	private static final long serialVersionUID = 1L;
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_live_classes_child")
	@SequenceGenerator(name = "seq_live_classes_child", sequenceName = "seq_live_classes_child", allocationSize = 1)
	@JsonProperty("liveClassesId")
	@Column(name = "live_Classes_Id")
	private Long liveClassesId;
	
	@JsonProperty("startClassDateTime")
	@JsonSerialize(using = LocalDateTimeSerializer.class)
	@JsonDeserialize(using = LocalDateTimeDeserializer.class)
	@JsonFormat(shape = JsonFormat.Shape.STRING)
	@Column(name = "start_class_date_time")
	private LocalDateTime startClassDateTime;
	
	@JsonProperty("endClassDateTime")
	@JsonSerialize(using = LocalDateTimeSerializer.class)
	@JsonDeserialize(using = LocalDateTimeDeserializer.class)
	@JsonFormat(shape = JsonFormat.Shape.STRING)
	@Column(name = "end_class_date_time")
	private LocalDateTime endClassDateTime;
	
	@JsonProperty("meetLink")
	@Column(name = "meet_link")
	private String meetLink;

	@JsonProperty("tutorId")
	@Column(name = "tutor_id")
	private Long tutorId;
	
	@JsonProperty("tutorName")
	@Column(name = "tutor_name")
	private String tutorName;

	@JsonProperty("courseId")
	@Column(name = "course_id")
	private String courseId;
	
	@JsonProperty("courseName")
	@Column(name = "course_name")
	private String courseName;

	@JsonProperty("batchId")
	@Column(name = "batch_id")
	private Long batchId;

	@JsonProperty("batchName")
	@Column(name = "batch_name")
	private String batchName;
	
	@JsonBackReference
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "live_Class_Id", referencedColumnName = "live_Class_Id")
	private LiveClassEntity liveClassEntity;
}
