package com.soul.lms.model.entity.holiday;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import com.soul.lms.model.entity.modelmasters.masterentitydb.OrganizationsDB;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;

@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "FND_HOLIDAY_MASTER")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class HolidayMaster extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_holiday_master")
    @SequenceGenerator(name = "seq_holiday_master", sequenceName = "seq_holiday_master", allocationSize = 1)
    private Long holidayId;

    @JsonProperty("holidayName")
    @Column(name = "holiday_name")
    private String holidayName;

    @JsonProperty("holidayType")
    @Column(name = "holiday_type")
    private String holidayType;

    @JsonSerialize(using = LocalDateSerializer.class)
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    @JsonProperty("holidayFromDate")
    @Column(name = "holiday_from_date")
    private LocalDate holidayFromDate;

    @JsonSerialize(using = LocalDateSerializer.class)
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    @JsonProperty("holidayToDate")
    @Column(name = "holiday_to_date")
    private LocalDate holidayToDate;

    @JsonProperty("isActive")
    @Column(name = "is_active")
    private Boolean isActive;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "branch_id", referencedColumnName = "org_id")
    private OrganizationsDB organizationsDB;

    @Transient
    @JsonProperty("userName")
    private String userName;

}
