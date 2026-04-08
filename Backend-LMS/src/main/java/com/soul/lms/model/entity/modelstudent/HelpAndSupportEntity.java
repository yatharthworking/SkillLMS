package com.soul.lms.model.entity.modelstudent;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soul.lms.commonentity.WhoseColumnsEntity;
import com.soul.lms.model.entity.modelmasters.masterentitydb.OrganizationsDB;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.io.Serial;
import java.io.Serializable;

@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "TXN_HELP_AND_SUPPORT")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class HelpAndSupportEntity extends WhoseColumnsEntity implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "seq_help_and_support")
    @SequenceGenerator(name = "seq_help_and_support", sequenceName = "seq_help_and_support", allocationSize = 1)
    @JsonProperty("grievanceId")
    @Column(name = "grievance_id")
    private Long grievanceId;

    @Lob
    @JsonProperty("complaintMessage")
    @Column(name = "complaint_message")
    private String complaintMessage;

    @JsonProperty("issueTitle")
    @Column(name = "issue_title")
    private String issueTitle;

    @JsonProperty("issueCategory")
    @Column(name = "issue_category")
    private String issueCategory;

    @JsonProperty("priorityLevel")
    @Column(name = "priority_level")
    private String priorityLevel;

    @JsonProperty("issueStatus")
    @Column(name = "issue_status")
    private String issueStatus;

    @JsonProperty("ticketId")
    @Column(name = "ticket_id")
    private String ticketId;

    @JsonProperty("attachmentName")
    @Column(name = "attachment_name")
    private String attachmentName;

    @Lob
    @JsonProperty("attachmentData")
    @Column(name = "attachment_data")
    private String attachmentData;

    @JsonProperty("isResolved")
    @Column(name = "is_resolved")
    private Boolean isResolved;

    @JsonProperty("complainantId")
    @Column(name = "complainant_id")
    private Long complainantId;

    @JsonProperty("complainantName")
    @Column(name = "complainant_name")
    private String complainantName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "branch_id", referencedColumnName = "org_id")
    private OrganizationsDB organizationsDB;

    @Lob
    @JsonProperty("adminReply")
    @Column(name = "admin_reply")
    private String adminReply;

    @Transient
    @JsonProperty("userName")
    private String userName;

}
