package com.soul.lms.webinar.service;

import com.soul.lms.dao.LmsDaoInterf;
import com.soul.lms.helper.HelperInterf;
import com.soul.lms.model.entity.email.EmailEntity;
import com.soul.lms.model.entity.modelregistration.registrationdb.UserInfoDB;
import com.soul.lms.model.entity.studymaterial.SubjectMasterDB;
import com.soul.lms.model.entity.webinar.*;
import com.soul.lms.model.jparepository.webinarrepository.WebinarInfoRepo;
import com.soul.lms.model.jparepository.webinarrepository.WebinarWatchProgressRepo;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service("webinarService")
public class WebinarService implements WebinarServiceInterf {

    private static final DateTimeFormatter WEBINAR_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    private static final DateTimeFormatter WEBINAR_DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

    //logger
    private final Logger logger = LogManager.getLogger(WebinarService.class);

    private final LmsDaoInterf lmsDaoInterf;
    private final Environment environment;
    private final HelperInterf helperInterf;
    private final WebinarInfoRepo webinarInfoRepo;
    private final WebinarWatchProgressRepo webinarWatchProgressRepo;

    @Autowired
    public WebinarService(LmsDaoInterf lmsDaoInterf,
                          Environment environment,
                          HelperInterf helperInterf,
                          WebinarInfoRepo webinarInfoRepo,
                          WebinarWatchProgressRepo webinarWatchProgressRepo) {
        super();
        this.lmsDaoInterf = lmsDaoInterf;
        this.environment = environment;
        this.helperInterf = helperInterf;
        this.webinarInfoRepo = webinarInfoRepo;
        this.webinarWatchProgressRepo = webinarWatchProgressRepo;
    }

    private String formatWebinarDate(LocalDate webinarDate) {
        return webinarDate == null ? null : webinarDate.format(WEBINAR_DATE_FORMATTER);
    }

    private String formatWebinarDateTime(LocalDateTime webinarDateTime) {
        return webinarDateTime == null ? null : webinarDateTime.format(WEBINAR_DATE_TIME_FORMATTER);
    }

    private String encodeWebinarImage(byte[] webinarImage) {
        return webinarImage == null || webinarImage.length == 0
                ? null
                : Base64.getEncoder().encodeToString(webinarImage);
    }

    private Map<String, Object> mapSpeakerResponse(SpeakerEntity speakerEntity) {
        LinkedHashMap<String, Object> speakerMap = new LinkedHashMap<>();
        speakerMap.put("speakerId", speakerEntity.getSpeakerId());
        speakerMap.put("name", speakerEntity.getName());
        speakerMap.put("designation", speakerEntity.getDesignation());
        speakerMap.put("about", speakerEntity.getAbout());
        speakerMap.put("emailId", speakerEntity.getEmailId());
        return speakerMap;
    }

    private Map<String, Object> mapKeyTakeawayResponse(KeyTakeawaysEntity keyTakeawaysEntity) {
        LinkedHashMap<String, Object> keyTakeawayMap = new LinkedHashMap<>();
        keyTakeawayMap.put("keytakeawayId", keyTakeawaysEntity.getKeytakeawayId());
        keyTakeawayMap.put("keyTakeaway", keyTakeawaysEntity.getKeyTakeaway());
        return keyTakeawayMap;
    }

    private Map<String, Object> mapAudienceResponse(AudienceEntity audienceEntity) {
        LinkedHashMap<String, Object> audienceMap = new LinkedHashMap<>();
        audienceMap.put("audienceId", audienceEntity.getAudienceId());
        audienceMap.put("audience", audienceEntity.getAudience());
        return audienceMap;
    }

    private Map<String, Object> mapWebinarInfoResponse(WebinarInfo webinarInfo) {
        LinkedHashMap<String, Object> webinarMap = new LinkedHashMap<>();

        WebinarEntity webinarEntity = webinarInfo.getWebinarEntity();
        SubjectMasterDB subjectMasterDB = webinarInfo.getSubjectMasterDB();
        String webinarImage = encodeWebinarImage(webinarInfo.getWebinarImageDB());

        webinarMap.put("webinarInfoId", webinarInfo.getWebinarInfoId());
        webinarMap.put("webinarId", webinarEntity != null ? webinarEntity.getWebinarId() : webinarInfo.getWebinarId());
        webinarMap.put("webinarDate", webinarEntity != null ? formatWebinarDate(webinarEntity.getWebinarDate()) : formatWebinarDate(webinarInfo.getWebinarDate()));
        webinarMap.put("webinarName", webinarInfo.getWebinarName());
        webinarMap.put("webinarStartTime", formatWebinarDateTime(webinarInfo.getWebinarStartTime()));
        webinarMap.put("webinarEndTime", formatWebinarDateTime(webinarInfo.getWebinarEndTime()));
        webinarMap.put("webinarRegStartTime", formatWebinarDateTime(webinarInfo.getWebinarRegStartTime()));
        webinarMap.put("webinarRegEndTime", formatWebinarDateTime(webinarInfo.getWebinarRegEndTime()));
        webinarMap.put("webinarRegPrice", webinarInfo.getWebinarRegPrice());
        webinarMap.put("webinarRegistrations", webinarInfo.getWebinarRegistrations());
        webinarMap.put("meetingLink", webinarInfo.getMeetingLink());
        webinarMap.put("recordingUrl", webinarInfo.getRecordingUrl());
        webinarMap.put("registrationType", webinarInfo.getRegistrationType());
        webinarMap.put("currency", webinarInfo.getCurrency());
        webinarMap.put("isActive", webinarInfo.getIsActive());
        webinarMap.put("createdBy", webinarInfo.getCreatedBy());
        webinarMap.put("updatedBy", webinarInfo.getUpdatedBy());
        webinarMap.put("creationTimeStamp", formatWebinarDateTime(webinarInfo.getCreationTimeStamp()));
        webinarMap.put("updationTimeStamp", formatWebinarDateTime(webinarInfo.getUpdationTimeStamp()));
        webinarMap.put("subjectId", subjectMasterDB != null ? subjectMasterDB.getSubjectMasterId() : webinarInfo.getSubjectId());
        webinarMap.put("subjectName", subjectMasterDB != null ? subjectMasterDB.getSubjectName() : webinarInfo.getSubjectName());
        webinarMap.put("subject", subjectMasterDB != null ? subjectMasterDB.getSubjectName() : webinarInfo.getSubjectName());
        webinarMap.put("webinarImage", webinarImage);
        webinarMap.put("webinarImageDB", webinarImage);
        webinarMap.put(
                "speakers",
                Optional.ofNullable(webinarInfo.getSpeakerEntityList())
                        .orElseGet(Collections::emptyList)
                        .stream()
                        .map(this::mapSpeakerResponse)
                        .collect(Collectors.toList())
        );
        webinarMap.put(
                "keyTakeaways",
                Optional.ofNullable(webinarInfo.getKeyTakeawaysEntityList())
                        .orElseGet(Collections::emptyList)
                        .stream()
                        .map(this::mapKeyTakeawayResponse)
                        .collect(Collectors.toList())
        );
        webinarMap.put(
                "audiences",
                Optional.ofNullable(webinarInfo.getAudienceEntityList())
                        .orElseGet(Collections::emptyList)
                        .stream()
                        .map(this::mapAudienceResponse)
                        .collect(Collectors.toList())
        );

        return webinarMap;
    }

    private String formatDurationLabel(long totalMinutes) {
        long hours = totalMinutes / 60;
        long minutes = totalMinutes % 60;

        if (hours > 0 && minutes > 0) {
            return hours + "h " + minutes + "m";
        }

        if (hours > 0) {
            return hours + "h";
        }

        return Math.max(totalMinutes, 1) + " mins";
    }

    private String formatResumeLabel(double watchedSeconds) {
        int totalSeconds = (int) Math.max(0, Math.floor(watchedSeconds));
        int minutes = totalSeconds / 60;
        int seconds = totalSeconds % 60;
        return String.format("%02d:%02d", minutes, seconds);
    }

    private String resolvePlaybackUrl(WebinarInfo webinarInfo) {
        String recordingUrl = Optional.ofNullable(webinarInfo.getRecordingUrl()).orElse("").trim();
        String meetingLink = Optional.ofNullable(webinarInfo.getMeetingLink()).orElse("").trim();
        String primaryLink = !recordingUrl.isBlank() ? recordingUrl : meetingLink;
        String normalizedLink = primaryLink.toLowerCase(Locale.ROOT);

        if (!primaryLink.isBlank() && (
                normalizedLink.endsWith(".mp4")
                        || normalizedLink.endsWith(".webm")
                        || normalizedLink.endsWith(".m3u8")
                        || normalizedLink.contains("youtube.com")
                        || normalizedLink.contains("youtu.be")
                        || normalizedLink.contains("vimeo.com")
        )) {
            return primaryLink;
        }

        return "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
    }

    private String resolvePlaybackType(String playbackUrl) {
        String normalizedUrl = Optional.ofNullable(playbackUrl).orElse("").toLowerCase(Locale.ROOT);

        if (normalizedUrl.contains("youtube.com") || normalizedUrl.contains("youtu.be") || normalizedUrl.contains("vimeo.com")) {
            return "iframe";
        }

        return "video";
    }

    private String extractSpeakerNames(Object speakersObject) {
        if (!(speakersObject instanceof List<?> speakers)) {
            return "";
        }

        return speakers.stream()
                .map(item -> {
                    if (item instanceof Map<?, ?> speakerMap) {
                        Object speakerName = speakerMap.get("name");
                        return speakerName == null ? "" : String.valueOf(speakerName);
                    }
                    return "";
                })
                .filter(name -> !name.trim().isEmpty())
                .collect(Collectors.joining(", "));
    }

    private Map<String, Object> buildRecordedWebinarResponse(WebinarInfo webinarInfo, WebinarWatchProgress progress) {
        Map<String, Object> webinarMap = new LinkedHashMap<>(mapWebinarInfoResponse(webinarInfo));
        String playbackUrl = resolvePlaybackUrl(webinarInfo);
        long durationMinutes = Math.max(1, java.time.Duration.between(webinarInfo.getWebinarStartTime(), webinarInfo.getWebinarEndTime()).toMinutes());
        double watchedSeconds = Optional.ofNullable(progress).map(WebinarWatchProgress::getWatchedSeconds).orElse(0.0);
        double totalDurationSeconds = Optional.ofNullable(progress)
                .map(WebinarWatchProgress::getTotalDurationSeconds)
                .filter(value -> value != null && value > 0)
                .orElse(durationMinutes * 60.0);
        double progressPercent = totalDurationSeconds <= 0 ? 0.0 : Math.min(100.0, (watchedSeconds / totalDurationSeconds) * 100.0);
        boolean completed = Optional.ofNullable(progress).map(WebinarWatchProgress::getCompleted).orElse(progressPercent >= 95.0);
        boolean isNew = webinarInfo.getWebinarEndTime() != null && webinarInfo.getWebinarEndTime().isAfter(LocalDateTime.now().minusDays(10));
        boolean trending = Optional.ofNullable(webinarInfo.getWebinarRegistrations()).orElse(0) >= 5;

        webinarMap.put("durationMinutes", durationMinutes);
        webinarMap.put("durationLabel", formatDurationLabel(durationMinutes));
        webinarMap.put("playbackUrl", playbackUrl);
        webinarMap.put("playbackType", resolvePlaybackType(playbackUrl));
        webinarMap.put("watchedSeconds", watchedSeconds);
        webinarMap.put("totalDurationSeconds", totalDurationSeconds);
        webinarMap.put("progressPercent", Math.round(progressPercent * 10.0) / 10.0);
        webinarMap.put("resumeLabel", watchedSeconds > 0 ? "Resume from " + formatResumeLabel(watchedSeconds) : "Start from beginning");
        webinarMap.put("isCompleted", completed);
        webinarMap.put("isNew", isNew);
        webinarMap.put("isTrending", trending);
        webinarMap.put("speakerNames", extractSpeakerNames(webinarMap.get("speakers")));
        webinarMap.put("popularityScore", Optional.ofNullable(webinarInfo.getWebinarRegistrations()).orElse(0));
        return webinarMap;
    }

    private KeyTakeawaysEntity cloneKeyTakeaway(KeyTakeawaysEntity source) {
        KeyTakeawaysEntity response = new KeyTakeawaysEntity();
        response.setKeytakeawayId(source.getKeytakeawayId());
        response.setKeyTakeaway(source.getKeyTakeaway());
        response.setCreatedBy(source.getCreatedBy());
        response.setUpdatedBy(source.getUpdatedBy());
        response.setCreationTimeStamp(source.getCreationTimeStamp());
        response.setUpdationTimeStamp(source.getUpdationTimeStamp());
        return response;
    }

    private AudienceEntity cloneAudience(AudienceEntity source) {
        AudienceEntity response = new AudienceEntity();
        response.setAudienceId(source.getAudienceId());
        response.setAudience(source.getAudience());
        response.setCreatedBy(source.getCreatedBy());
        response.setUpdatedBy(source.getUpdatedBy());
        response.setCreationTimeStamp(source.getCreationTimeStamp());
        response.setUpdationTimeStamp(source.getUpdationTimeStamp());
        return response;
    }

    private SpeakerEntity cloneSpeaker(SpeakerEntity source) {
        SpeakerEntity response = new SpeakerEntity();
        response.setSpeakerId(source.getSpeakerId());
        response.setName(source.getName());
        response.setDesignation(source.getDesignation());
        response.setAbout(source.getAbout());
        response.setEmailId(source.getEmailId());
        response.setCreatedBy(source.getCreatedBy());
        response.setUpdatedBy(source.getUpdatedBy());
        response.setCreationTimeStamp(source.getCreationTimeStamp());
        response.setUpdationTimeStamp(source.getUpdationTimeStamp());
        return response;
    }

    private WebinarInfo cloneWebinarInfo(WebinarInfo source) {
        WebinarInfo response = new WebinarInfo();
        SubjectMasterDB subjectMasterDB = source.getSubjectMasterDB();

        response.setWebinarInfoId(source.getWebinarInfoId());
        response.setWebinarName(source.getWebinarName());
        response.setWebinarStartTime(source.getWebinarStartTime());
        response.setWebinarEndTime(source.getWebinarEndTime());
        response.setWebinarRegStartTime(source.getWebinarRegStartTime());
        response.setWebinarRegEndTime(source.getWebinarRegEndTime());
        response.setWebinarRegPrice(source.getWebinarRegPrice());
        response.setWebinarRegistrations(source.getWebinarRegistrations());
        response.setMeetingLink(source.getMeetingLink());
        response.setRecordingUrl(source.getRecordingUrl());
        response.setIsActive(source.getIsActive());
        response.setWebinarImageDB(source.getWebinarImageDB());
        response.setRegistrationType(source.getRegistrationType());
        response.setCurrency(source.getCurrency());
        response.setWebinarDate(source.getWebinarEntity() != null ? source.getWebinarEntity().getWebinarDate() : source.getWebinarDate());
        response.setWebinarId(source.getWebinarEntity() != null ? source.getWebinarEntity().getWebinarId() : source.getWebinarId());
        response.setSubjectName(subjectMasterDB != null ? subjectMasterDB.getSubjectName() : source.getSubjectName());
        response.setSubjectId(subjectMasterDB != null ? subjectMasterDB.getSubjectMasterId() : source.getSubjectId());
        response.setCreatedBy(source.getCreatedBy());
        response.setUpdatedBy(source.getUpdatedBy());
        response.setCreationTimeStamp(source.getCreationTimeStamp());
        response.setUpdationTimeStamp(source.getUpdationTimeStamp());
        response.setKeyTakeawaysEntityList(
                Optional.ofNullable(source.getKeyTakeawaysEntityList())
                        .orElseGet(Collections::emptyList)
                        .stream()
                        .map(this::cloneKeyTakeaway)
                        .collect(Collectors.toList())
        );
        response.setAudienceEntityList(
                Optional.ofNullable(source.getAudienceEntityList())
                        .orElseGet(Collections::emptyList)
                        .stream()
                        .map(this::cloneAudience)
                        .collect(Collectors.toList())
        );
        response.setSpeakerEntityList(
                Optional.ofNullable(source.getSpeakerEntityList())
                        .orElseGet(Collections::emptyList)
                        .stream()
                        .map(this::cloneSpeaker)
                        .collect(Collectors.toList())
        );
        return response;
    }

    private WebinarEntity cloneWebinarEntity(WebinarEntity source) {
        WebinarEntity response = new WebinarEntity();
        response.setWebinarId(source.getWebinarId());
        response.setWebinarDate(source.getWebinarDate());
        response.setIsActive(source.getIsActive());
        response.setCreatedBy(source.getCreatedBy());
        response.setUpdatedBy(source.getUpdatedBy());
        response.setCreationTimeStamp(source.getCreationTimeStamp());
        response.setUpdationTimeStamp(source.getUpdationTimeStamp());
        response.setWebinarInfoList(
                Optional.ofNullable(source.getWebinarInfoList())
                        .orElseGet(Collections::emptyList)
                        .stream()
                        .map(this::cloneWebinarInfo)
                        .collect(Collectors.toList())
        );
        return response;
    }

    //service layer method to add webinar Details to be used to admin to add new webinar details or edit Existing webinar Details
    @Override
    @Transactional
    public ResponseEntity<Map<String, Object>> addOrEditWebinarDetails(WebinarEntity webinarEntity) {

        //for updating existing webinar details the user need to send webinarId.
        HashMap<String, Object> responseMap = new HashMap<>();
        Boolean isSave;

        //Taking arrayList if in future client Team send multiple webinars to add
        ArrayList<HashMap<String,String>> emailDataList = new ArrayList<>();


        try {
                //fetching webinar entity Details based on webinarDate or webinarId
                WebinarEntity optionalWebinarEntity = lmsDaoInterf.fetchWebinarMaster(webinarEntity.getWebinarDate() != null ? webinarEntity.getWebinarDate() : null, Optional.ofNullable(webinarEntity.getWebinarId())).orElse(null);

                //if object is present then proceed
                if(!Objects.isNull(optionalWebinarEntity))
                {
                    //setting data members
                    optionalWebinarEntity.setWebinarDate(webinarEntity.getWebinarDate());
                    optionalWebinarEntity.setUpdatedBy(webinarEntity.getUserId());
                    optionalWebinarEntity.setIsActive(Boolean.TRUE);

                    //checking here if child webinarInfoList is empty or null or not.
                    if(!Objects.isNull(webinarEntity.getWebinarInfoList()) && !webinarEntity.getWebinarInfoList().isEmpty()) {

                        List<WebinarInfo> existingWebinarInfoList = optionalWebinarEntity.getWebinarInfoList();


                        //loop to iterate over list of webinarInfos
                        webinarEntity.getWebinarInfoList().forEach(webinarInfo -> {

                            HashMap<String,String> emailDataMap = new HashMap<>();

                            //fetching existing webinar infos based on webinarInfoId
                            Optional<WebinarInfo> existingWebinarInfo = existingWebinarInfoList.stream().filter(webInfo -> !Objects.isNull(webinarInfo.getWebinarInfoId()) && Objects.equals(webInfo.getWebinarInfoId(), webinarInfo.getWebinarInfoId())).findFirst();

                            //here handling updating of existing webinar details
                            if(existingWebinarInfo.isPresent())
                            {

                                int webInfoIndex = existingWebinarInfoList.indexOf(existingWebinarInfo.get());

                                //setting data members
                                existingWebinarInfo.get().setWebinarName(webinarInfo.getWebinarName());
                                existingWebinarInfo.get().setWebinarStartTime(webinarInfo.getWebinarStartTime());
                                existingWebinarInfo.get().setWebinarEndTime(webinarInfo.getWebinarEndTime());
                                existingWebinarInfo.get().setWebinarRegStartTime(webinarInfo.getWebinarRegStartTime());
                                existingWebinarInfo.get().setWebinarRegEndTime(webinarInfo.getWebinarRegEndTime());
                                existingWebinarInfo.get().setWebinarRegPrice(webinarInfo.getWebinarRegPrice());
//                                existingWebinarInfo.get().setSubject(webinarInfo.getSubject());
                                existingWebinarInfo.get().setMeetingLink(webinarInfo.getMeetingLink());
                                existingWebinarInfo.get().setRecordingUrl(webinarInfo.getRecordingUrl());
                                existingWebinarInfo.get().setRegistrationType(webinarInfo.getRegistrationType() != null ? webinarInfo.getRegistrationType() : null);
                                existingWebinarInfo.get().setCurrency(webinarInfo.getCurrency() != null ? webinarInfo.getCurrency() : null);
                                existingWebinarInfo.get().setWebinarImageDB(webinarInfo.getWebinarImageDB());
                                existingWebinarInfo.get().setSubjectMasterDB(webinarInfo.getSubjectMasterDB());
                                existingWebinarInfo.get().setIsActive(Boolean.TRUE);
                                existingWebinarInfo.get().setUpdatedBy(webinarEntity.getUserId());

                                //for child Key TakeAway
                                if(!Objects.isNull(webinarInfo.getKeyTakeawaysEntityList()) && !webinarInfo.getKeyTakeawaysEntityList().isEmpty()){

                                    List<KeyTakeawaysEntity> existingKeyTakeawaysList = existingWebinarInfo.get().getKeyTakeawaysEntityList();
                                    Set<Long> retainedKeyTakeawayIds = webinarInfo.getKeyTakeawaysEntityList().stream()
                                            .map(KeyTakeawaysEntity::getKeytakeawayId)
                                            .filter(Objects::nonNull)
                                            .collect(Collectors.toSet());
                                    existingKeyTakeawaysList.removeIf(existingKeyTakeaway ->
                                            existingKeyTakeaway.getKeytakeawayId() != null && !retainedKeyTakeawayIds.contains(existingKeyTakeaway.getKeytakeawayId()));

                                    //loop to iterate over list of keyTakeaways
                                    webinarInfo.getKeyTakeawaysEntityList().forEach(keyTakeawaysEntity -> {

                                        //fetching existing keyTakeaways information based on keytakeawayId
                                        Optional<KeyTakeawaysEntity> existingKeyTakeaway = existingKeyTakeawaysList.stream().filter(keyTakeawaysEntity1 -> !Objects.isNull(keyTakeawaysEntity.getKeytakeawayId()) && Objects.equals(keyTakeawaysEntity.getKeytakeawayId(),keyTakeawaysEntity1.getKeytakeawayId())).findFirst();

                                        //updating Existing keyTakeaway List
                                        if(existingKeyTakeaway.isPresent()){

                                            int keyTakeawayIndex = existingKeyTakeawaysList.indexOf(existingKeyTakeaway.get());

                                            //setting data members
                                            existingKeyTakeaway.get().setKeyTakeaway(keyTakeawaysEntity.getKeyTakeaway());

                                            //setting reference
                                            existingKeyTakeaway.get().setWebinarInfo(existingWebinarInfo.get());
                                            existingKeyTakeawaysList.set(keyTakeawayIndex,existingKeyTakeaway.get());

                                        }
                                        //adding new keyTakeaway list
                                        else
                                        {
                                            KeyTakeawaysEntity newKeyTakeawayInfo = new KeyTakeawaysEntity();

                                            //setting Data Members
                                            newKeyTakeawayInfo.setKeyTakeaway(keyTakeawaysEntity.getKeyTakeaway());

                                            //setting reference
                                            newKeyTakeawayInfo.setWebinarInfo(existingWebinarInfo.get());

                                            existingKeyTakeawaysList.add(newKeyTakeawayInfo);
                                        }

                                        existingWebinarInfo.get().setKeyTakeawaysEntityList(existingKeyTakeawaysList);
                                    });
                                }

                                //for child Key audience
                                if(!Objects.isNull(webinarInfo.getAudienceEntityList()) && !webinarInfo.getAudienceEntityList().isEmpty()){

                                    List<AudienceEntity> existingAudienceEntityList = existingWebinarInfo.get().getAudienceEntityList();
                                    Set<Long> retainedAudienceIds = webinarInfo.getAudienceEntityList().stream()
                                            .map(AudienceEntity::getAudienceId)
                                            .filter(Objects::nonNull)
                                            .collect(Collectors.toSet());
                                    existingAudienceEntityList.removeIf(existingAudience ->
                                            existingAudience.getAudienceId() != null && !retainedAudienceIds.contains(existingAudience.getAudienceId()));

                                    //loop to iterate over list of audienceEntity
                                    webinarInfo.getAudienceEntityList().forEach(audienceEntity -> {

                                        //fetching existing audience information based on audienceId
                                        Optional<AudienceEntity> existingAudience = existingAudienceEntityList.stream().filter(audienceEntity1 -> !Objects.isNull(audienceEntity.getAudienceId()) && Objects.equals(audienceEntity.getAudienceId(),audienceEntity1.getAudienceId())).findFirst();

                                        //updating Existing Audience List
                                        if(existingAudience.isPresent()){

                                            int audienceIndex = existingAudienceEntityList.indexOf(existingAudience.get());

                                            //setting data members
                                            existingAudience.get().setAudience(audienceEntity.getAudience());

                                            //setting reference
                                            existingAudience.get().setWebinarInfo(existingWebinarInfo.get());
                                            existingAudienceEntityList.set(audienceIndex,existingAudience.get());

                                        }
                                        //adding new Audience list
                                        else
                                        {
                                            AudienceEntity newAudienceInfo = new AudienceEntity();

                                            //setting Data Members
                                            newAudienceInfo.setAudience(audienceEntity.getAudience());

                                            //setting reference
                                            newAudienceInfo.setWebinarInfo(existingWebinarInfo.get());

                                            existingAudienceEntityList.add(newAudienceInfo);
                                        }

                                        existingWebinarInfo.get().setAudienceEntityList(existingAudienceEntityList);
                                    });
                                }

                                //for Child Speaker Entity
                                if(!Objects.isNull(webinarInfo.getSpeakerEntityList()) && !webinarInfo.getSpeakerEntityList().isEmpty())
                                {
                                    List<SpeakerEntity> existingSpeakerList = existingWebinarInfo.get().getSpeakerEntityList();
                                    Set<Long> retainedSpeakerIds = webinarInfo.getSpeakerEntityList().stream()
                                            .map(SpeakerEntity::getSpeakerId)
                                            .filter(Objects::nonNull)
                                            .collect(Collectors.toSet());
                                    existingSpeakerList.removeIf(existingSpeaker ->
                                            existingSpeaker.getSpeakerId() != null && !retainedSpeakerIds.contains(existingSpeaker.getSpeakerId()));

                                    //loop to iterate over list of speakers
                                    webinarInfo.getSpeakerEntityList().forEach(speakerEntity -> {

                                        //fetching existing speakers information based on speakerId
                                        Optional<SpeakerEntity> existingSpeaker = existingSpeakerList.stream().filter(speakerEntity1 -> !Objects.isNull(speakerEntity.getSpeakerId()) && Objects.equals(speakerEntity.getSpeakerId(), speakerEntity1.getSpeakerId())).findFirst();

                                        //updating existing speakers' list
                                        if(existingSpeaker.isPresent())
                                        {
                                            int speakerIndex = existingSpeakerList.indexOf(existingSpeaker.get());

                                            //setting data members
                                            existingSpeaker.get().setName(speakerEntity.getName());
                                            existingSpeaker.get().setDesignation(speakerEntity.getDesignation());
                                            existingSpeaker.get().setAbout(speakerEntity.getAbout());
                                            existingSpeaker.get().setEmailId(speakerEntity.getEmailId());

                                            //setting reference
                                            existingSpeaker.get().setWebinarInfo(existingWebinarInfo.get());

                                            existingSpeakerList.set(speakerIndex, existingSpeaker.get());
                                        }

                                        //adding new speakers' list
                                        else
                                        {
                                            SpeakerEntity newSpeakerInfo = new SpeakerEntity();

                                            //setting Data Members
                                            newSpeakerInfo.setName(speakerEntity.getName());
                                            newSpeakerInfo.setDesignation(speakerEntity.getDesignation());
                                            newSpeakerInfo.setAbout(speakerEntity.getAbout());
                                            newSpeakerInfo.setEmailId(speakerEntity.getEmailId());

                                            //setting reference
                                            newSpeakerInfo.setWebinarInfo(existingWebinarInfo.get());

                                            existingSpeakerList.add(newSpeakerInfo);
                                        }

                                        // Setting data for emailDataMap
                                        emailDataMap.put("speakerName", speakerEntity.getName());
                                        emailDataMap.put("speakerDesignation", speakerEntity.getDesignation());
                                        emailDataMap.put("speakerEmailId", speakerEntity.getEmailId());
                                        emailDataMap.put("WebinarStartTime", String.valueOf(webinarInfo.getWebinarStartTime()));
                                        emailDataMap.put("meetingLink", webinarInfo.getMeetingLink());

                                        // Adding emailDataMap to emailDataList
                                        emailDataList.add(new HashMap<>(emailDataMap));
                                        emailDataList.trimToSize();

                                        existingWebinarInfo.get().setSpeakerEntityList(existingSpeakerList);

                                    });
                                }

                                //setting reference
                                existingWebinarInfo.get().setWebinarEntity(optionalWebinarEntity);

                                //updating object in a list
                                existingWebinarInfoList.set(webInfoIndex, existingWebinarInfo.get());

                            }

                            //here Handling adding of new Webinar details for same webinar date
                            else
                            {
                                WebinarInfo newWebInfo = new WebinarInfo();

                                //setting data members
                                newWebInfo.setWebinarName(webinarInfo.getWebinarName());
                                newWebInfo.setWebinarStartTime(webinarInfo.getWebinarStartTime());
                                newWebInfo.setWebinarEndTime(webinarInfo.getWebinarEndTime());
                                newWebInfo.setWebinarRegStartTime(webinarInfo.getWebinarRegStartTime());
                                newWebInfo.setWebinarRegEndTime(webinarInfo.getWebinarRegEndTime());
                                newWebInfo.setWebinarRegPrice(webinarInfo.getWebinarRegPrice());
//                                newWebInfo.setSubject(webinarInfo.getSubject());
                                newWebInfo.setMeetingLink(webinarInfo.getMeetingLink());
                                newWebInfo.setRecordingUrl(webinarInfo.getRecordingUrl());
                                newWebInfo.setRegistrationType(webinarInfo.getRegistrationType());
                                newWebInfo.setCurrency(webinarInfo.getCurrency());
                                newWebInfo.setWebinarImageDB(webinarInfo.getWebinarImageDB());
                                newWebInfo.setSubjectMasterDB(webinarInfo.getSubjectMasterDB());

                                newWebInfo.setIsActive(Boolean.TRUE);
                                newWebInfo.setCreatedBy(webinarEntity.getUserId());

                                //setting reference
                                newWebInfo.setWebinarEntity(optionalWebinarEntity);

                                //for child keyTakeAway
                                if (!Objects.isNull(webinarInfo.getKeyTakeawaysEntityList()) && !webinarInfo.getKeyTakeawaysEntityList().isEmpty()) {

                                    ArrayList<KeyTakeawaysEntity> newKeyTakeawayEntityList = new ArrayList<>();

                                    webinarInfo.getKeyTakeawaysEntityList().forEach(newKeyTakeawayEntity ->{

                                        KeyTakeawaysEntity newKeyTakeawayInfo = new KeyTakeawaysEntity();

                                        //setting Data Members
                                        newKeyTakeawayInfo.setKeyTakeaway(newKeyTakeawayEntity.getKeyTakeaway());

                                        //setting reference
                                        newKeyTakeawayInfo.setWebinarInfo(newWebInfo);
                                        newKeyTakeawayEntityList.add(newKeyTakeawayInfo);
                                        newKeyTakeawayEntityList.trimToSize();
                                    });

                                    newWebInfo.setKeyTakeawaysEntityList(newKeyTakeawayEntityList);
                                }

                                //for child Audience
                                if (!Objects.isNull(webinarInfo.getAudienceEntityList()) && !webinarInfo.getAudienceEntityList().isEmpty()) {

                                    ArrayList<AudienceEntity> newAudienceEntityList = new ArrayList<>();

                                    webinarInfo.getAudienceEntityList().forEach(newAudienceEntity ->{

                                        AudienceEntity newAudienceInfo = new AudienceEntity();

                                        //setting Data Members
                                        newAudienceInfo.setAudience(newAudienceEntity.getAudience());

                                        //setting reference
                                        newAudienceInfo.setWebinarInfo(newWebInfo);
                                        newAudienceEntityList.add(newAudienceInfo);
                                        newAudienceEntityList.trimToSize();
                                    });

                                    newWebInfo.setAudienceEntityList(newAudienceEntityList);
                                }

                                //for child Speaker
                                if (!Objects.isNull(webinarInfo.getSpeakerEntityList()) && !webinarInfo.getSpeakerEntityList().isEmpty()) {

                                    ArrayList<SpeakerEntity> newSpeakerEntityList = new ArrayList<>();

                                    webinarInfo.getSpeakerEntityList().forEach(newSpeaker -> {

                                        SpeakerEntity newSpeakerInfo = new SpeakerEntity();

                                        //setting Data Members
                                        newSpeakerInfo.setName(newSpeaker.getName());
                                        newSpeakerInfo.setDesignation(newSpeaker.getDesignation());
                                        newSpeakerInfo.setAbout(newSpeaker.getAbout());
                                        newSpeakerInfo.setEmailId(newSpeaker.getEmailId());

                                        //setting reference
                                        newSpeakerInfo.setWebinarInfo(newWebInfo);
                                        newSpeakerEntityList.add(newSpeakerInfo);
                                        newSpeakerEntityList.trimToSize();

                                        // Setting data for emailDataMap
                                        emailDataMap.put("speakerName", newSpeaker.getName());
                                        emailDataMap.put("speakerDesignation", newSpeaker.getDesignation());
                                        emailDataMap.put("speakerEmailId", newSpeaker.getEmailId());
                                        emailDataMap.put("WebinarStartTime", String.valueOf(webinarInfo.getWebinarStartTime()));
                                        emailDataMap.put("meetingLink", webinarInfo.getMeetingLink());

                                        // Adding emailDataMap to emailDataList
                                        emailDataList.add(new HashMap<>(emailDataMap));
                                        emailDataList.trimToSize();
                                    });

                                    newWebInfo.setSpeakerEntityList(newSpeakerEntityList);

                                }
                                existingWebinarInfoList.add(newWebInfo);
                            }
                        });
                    }
                    isSave = lmsDaoInterf.saveWebinar(optionalWebinarEntity);
                }

                //here handling adding of new webinar Details for new webinar date
                else {
                    WebinarEntity newWebinarDetails = new WebinarEntity();
                    newWebinarDetails.setWebinarDate(webinarEntity.getWebinarDate());
                    newWebinarDetails.setCreatedBy(webinarEntity.getUserId());
                    newWebinarDetails.setIsActive(Boolean.TRUE);

                    if (!Objects.isNull(webinarEntity.getWebinarInfoList()) && !webinarEntity.getWebinarInfoList().isEmpty()) {

                        ArrayList<WebinarInfo> newWebinarInfoList = new ArrayList<>();

                        webinarEntity.getWebinarInfoList().forEach(newWebinar -> {

                            HashMap<String,String> emailDataMap = new HashMap<>();

                            WebinarInfo newWebInfo = new WebinarInfo();

                            //setting data members
                            newWebInfo.setWebinarName(newWebinar.getWebinarName());
                            newWebInfo.setWebinarStartTime(newWebinar.getWebinarStartTime());
                            newWebInfo.setWebinarEndTime(newWebinar.getWebinarEndTime());
                            newWebInfo.setWebinarRegStartTime(newWebinar.getWebinarRegStartTime());
                            newWebInfo.setWebinarRegEndTime(newWebinar.getWebinarRegEndTime());
                            newWebInfo.setWebinarRegPrice(newWebinar.getWebinarRegPrice());
//                            newWebInfo.setSubject(newWebinar.getSubject());
                            newWebInfo.setMeetingLink(newWebinar.getMeetingLink());
                            newWebInfo.setRecordingUrl(newWebinar.getRecordingUrl());
                            newWebInfo.setRegistrationType(newWebinar.getRegistrationType());
                            newWebInfo.setCurrency(newWebinar.getCurrency());
                            newWebInfo.setWebinarImageDB(newWebinar.getWebinarImageDB());
                            newWebInfo.setSubjectMasterDB(newWebinar.getSubjectMasterDB());

                            newWebInfo.setIsActive(Boolean.TRUE);
                            newWebInfo.setCreatedBy(webinarEntity.getUserId());

                            //setting reference
                            newWebInfo.setWebinarEntity(newWebinarDetails);

                            //for child keyTakeAway
                            if (!Objects.isNull(newWebinar.getKeyTakeawaysEntityList()) && !newWebinar.getKeyTakeawaysEntityList().isEmpty()) {

                                ArrayList<KeyTakeawaysEntity> newKeyTakeawayEntityList = new ArrayList<>();

                                newWebinar.getKeyTakeawaysEntityList().forEach(newKeyTakeawayEntity -> {

                                    KeyTakeawaysEntity newKeyTakeawayInfo = new KeyTakeawaysEntity();

                                    //setting Data Members
                                    newKeyTakeawayInfo.setKeyTakeaway(newKeyTakeawayEntity.getKeyTakeaway());

                                    //setting reference
                                    newKeyTakeawayInfo.setWebinarInfo(newWebInfo);
                                    newKeyTakeawayEntityList.add(newKeyTakeawayInfo);
                                    newKeyTakeawayEntityList.trimToSize();
                                });

                                newWebInfo.setKeyTakeawaysEntityList(newKeyTakeawayEntityList);
                            }

                            //for child Audience
                            if (!Objects.isNull(newWebinar.getAudienceEntityList()) && !newWebinar.getAudienceEntityList().isEmpty()) {

                                ArrayList<AudienceEntity> newAudienceEntityList = new ArrayList<>();

                                newWebinar.getAudienceEntityList().forEach(newAudienceEntity -> {

                                    AudienceEntity newAudienceInfo = new AudienceEntity();

                                    //setting Data Members
                                    newAudienceInfo.setAudience(newAudienceEntity.getAudience());

                                    //setting reference
                                    newAudienceInfo.setWebinarInfo(newWebInfo);
                                    newAudienceEntityList.add(newAudienceInfo);
                                    newAudienceEntityList.trimToSize();
                                });

                                newWebInfo.setAudienceEntityList(newAudienceEntityList);
                            }

                            //for child Speaker
                            if (!Objects.isNull(newWebinar.getSpeakerEntityList()) && !newWebinar.getSpeakerEntityList().isEmpty()) {
                                ArrayList<SpeakerEntity> newSpeakerEntityList = new ArrayList<>();

                                newWebinar.getSpeakerEntityList().forEach(newSpeaker -> {
                                    SpeakerEntity newSpeakerInfo = new SpeakerEntity();

                                    //setting Data Members
                                    newSpeakerInfo.setName(newSpeaker.getName());
                                    newSpeakerInfo.setDesignation(newSpeaker.getDesignation());
                                    newSpeakerInfo.setAbout(newSpeaker.getAbout());
                                    newSpeakerInfo.setEmailId(newSpeaker.getEmailId());

                                    //setting reference
                                    newSpeakerInfo.setWebinarInfo(newWebInfo);
                                    newSpeakerEntityList.add(newSpeakerInfo);
                                    newSpeakerEntityList.trimToSize();

                                    // Setting data for emailDataMap
                                    emailDataMap.put("speakerName", newSpeaker.getName());
                                    emailDataMap.put("speakerDesignation", newSpeaker.getDesignation());
                                    emailDataMap.put("speakerEmailId", newSpeaker.getEmailId());
                                    emailDataMap.put("WebinarStartTime", String.valueOf(newWebinar.getWebinarStartTime()));
                                    emailDataMap.put("meetingLink", newWebinar.getMeetingLink());

                                    // Adding emailDataMap to emailDataList
                                    emailDataList.add(new HashMap<>(emailDataMap));
                                });

                                newWebInfo.setSpeakerEntityList(newSpeakerEntityList);

                            }
                            newWebinarInfoList.add(newWebInfo);

                            //Adding emailDataMap to emailDataList
                            emailDataList.add(emailDataMap);
                            emailDataList.trimToSize();
                        });
                        newWebinarDetails.setWebinarInfoList(newWebinarInfoList);
                    }

                    isSave = lmsDaoInterf.saveWebinar(newWebinarDetails);
                }


            if (isSave) {

                //calling the webinarEmailSendResponse method to send email on speaker
                ArrayList<Map<String,Object>> webinarEmailSendResponse = getWebinarEmailSendResponse(emailDataList);

                responseMap.put("message", "Webinar Details saved successfully.");
                responseMap.put("status",Boolean.TRUE);
                responseMap.put("webinarEmailSendResponse",webinarEmailSendResponse);
                return ResponseEntity.ok(responseMap);

            } else {
                responseMap.put("message", "Error while saving Webinar details.");
                responseMap.put("status",Boolean.FALSE);
                return ResponseEntity.badRequest().body(responseMap);
            }

        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }

    }

    //service layer method to send email to a speaker on their emailId on successful creation of webinar(admin side)
    @Override
    public ArrayList<Map<String,Object>> getWebinarEmailSendResponse(ArrayList<HashMap<String,String>> emailDataList){

        ArrayList<Map<String,Object>> emailSendResponseList = new ArrayList<>();

        //Iterating over List of email Data
        emailDataList.forEach(emailData -> {

            //creating new emailEntity Object
            EmailEntity emailEntity = new EmailEntity();

            //setting data members(creating email entity)
            emailEntity.setFrom(Objects.requireNonNull(environment.getProperty("spring.mail.username")));
            emailEntity.setTo(emailData.get("speakerEmailId").trim());
            emailEntity.setSubject("Invitation to Speak at Our Upcoming Webinar");
            emailEntity.setMessageHeader(emailData.get("speakerName"));
            emailEntity.setMessageBodyP1("We are delighted to invite you to be a speaker at our upcoming webinar. We believe your participation would greatly contribute to the success of the event.");

            // Parse webinarStartTime to get date and time separately
            LocalDateTime webinarStartTime = LocalDateTime.parse(emailData.get("WebinarStartTime"));
            String webinarDate = webinarStartTime.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
            String webinarTime = webinarStartTime.format(DateTimeFormatter.ofPattern("HH:mm a"));//converting 24 hour date to 12 hour date

            emailEntity.setMessageBodyP2("The webinar is scheduled to take place on " + webinarDate + " at " + webinarTime + ". You can join the webinar using the following link:" + emailData.get("meetingLink")+"<br><br>Please let us know if you are available to join us as a speaker. We would be more than happy to discuss any details or answer any questions you might have.");
            emailEntity.setMessageBodyP3("Thank you for considering our invitation. We look forward to your positive response.");

            // sending email and collecting response
            ResponseEntity<Map<String, Object>> emailResponse = helperInterf.sendTemplateEmail(emailEntity);

            HashMap<String, Object> response = new HashMap<>();
            response.put("emailId", emailEntity.getTo());

            //handling successfully email sent here
            if (emailResponse.getStatusCode().is2xxSuccessful() && (Boolean) Objects.requireNonNull(emailResponse.getBody()).get("status")) {

                response.put("message", "email sent successfully to " + emailEntity.getTo());
                response.put("status", true);

            } else {
                //handling failure in email send here
                response.put("message", "Failed to send email to " + emailEntity.getTo());
                response.put("status", false);
                response.put("exception", Objects.requireNonNull(emailResponse.getBody()).get("exception"));

            }
            emailSendResponseList.add(response);
            emailSendResponseList.trimToSize();

        });
        return emailSendResponseList;
    }

    //service layer method to fetch webinarDetails by Date or Id
    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<WebinarEntity> fetchWebinarDetailsByDateOrId(LocalDate searchDate, Optional<Long> webinarId) {
        try {
            Optional<WebinarEntity> optionalWebinarEntity = lmsDaoInterf.fetchWebinarMaster(searchDate, webinarId);
            return optionalWebinarEntity
                    .map(this::cloneWebinarEntity)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.unprocessableEntity().build());

        } catch (Exception e) {
            logger.error("Error fetching webinar details", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //service Layer method to fetch list of webinars from today
    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String,Object>> fetchWebinarDetailsFromToday(String username, int page, int size, Optional<Long> subjectId) {

        HashMap<String,Object> responseMap = new HashMap<>();

        try{
            Pageable pageable = PageRequest.of(page, size);

            // Passing null instead of LocalDateTime.now() to fetch all active webinars regardless of time
            Page<WebinarInfo> webinarInfoPage = lmsDaoInterf.fetchWebinarSchedules(null, pageable, subjectId.orElse(null)).orElseGet(Page::empty);

            //fetching list of webinarInfo
            List<WebinarInfo> webinarInfoList = webinarInfoPage.getContent();

            //here checking if webinarInfoList is empty or not
            if(!webinarInfoList.isEmpty()){

            //fetching list of registered webinarInfoIds
            List<Long> registeredWebinarInfoIds = lmsDaoInterf.fetchRegisteredWebinarInfoIds(username,null).orElseGet(Page::empty).getContent();

            //fetching list of attended webinarInfoIds
            List<Long> attendedWebinarInfoIds = lmsDaoInterf.fetchAttendedWebinarsInfoIds(username,null).orElseGet(Page::empty).getContent();

                // combining registered and attended webinarInfoIds
                Set<Long> combinedWebinarInfoIds = Stream.concat(registeredWebinarInfoIds.stream(), attendedWebinarInfoIds.stream())
                        .collect(Collectors.toSet());

                // Mapping all webinarInfoObjects without filtering out registered/attended ones
                List<Map<String, Object>> updatedWebinarInfoList = webinarInfoList.stream()
                        .map(this::mapWebinarInfoResponse)
                        .collect(Collectors.toList());


                responseMap.put("data", updatedWebinarInfoList);
                responseMap.put("currentPage",page);
                responseMap.put("pageSize",size);
                responseMap.put("totalPages",webinarInfoPage.getTotalPages());
                return ResponseEntity.ok(responseMap);

            }else{

                //here handling the case when webinarEntityList is empty
                responseMap.put("data", Collections.emptyList());
                responseMap.put("currentPage", page);
                responseMap.put("pageSize", size);
                responseMap.put("totalPages", 0);
                return ResponseEntity.ok(responseMap);

            }

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service Layer method to fetch webinar list(admin side)
    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String ,Object>> fetchWebinarSchedules(int page, int size, Optional<Long> subjectId){

        HashMap<String ,Object> responseMap = new HashMap<>();

        try{
            Pageable pageable = PageRequest.of(page,size);

            //fetching child webinarInfo on request of client Team
            Page<WebinarInfo> webinarInfoPage = lmsDaoInterf.fetchWebinarSchedules(null, pageable, subjectId.orElse(null)).orElseGet(Page::empty);

            List<WebinarInfo> webinarInfoList = webinarInfoPage.getContent();

            //here checking if the webinarInfoList is empty or not
            if(!webinarInfoList.isEmpty()){

                List<Map<String, Object>> webinarFinalList = webinarInfoList.stream()
                        .map(this::mapWebinarInfoResponse)
                        .collect(Collectors.toList());

                responseMap.put("data",webinarFinalList);
                responseMap.put("currentPage",page);
                responseMap.put("pageSize",size);
                responseMap.put("totalPages",webinarInfoPage.getTotalPages());
                return ResponseEntity.ok(responseMap);

            }else {

                //here handling the case where webinarInfoList is empty
                responseMap.put("data", Collections.emptyList());
                responseMap.put("currentPage", page);
                responseMap.put("pageSize", size);
                responseMap.put("totalPages", 0);
                return ResponseEntity.ok(responseMap);

            }

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service layer method to register for webinars
    @Override
    public ResponseEntity<Map<String, Object>> registerWebinar(WebinarRegister webinarRegister) {

        HashMap<String ,Object> responseMap = new HashMap<>();

        try{

            //fetching webinar info details based on the webinar_info_id sent from client side
            Optional<WebinarInfo> fetchedWebinarInfo = lmsDaoInterf.fetchActiveWebinarInfoById(webinarRegister.getWebinarInfoId());

            Long studentId = 0L;
            //fetching userDetailsId based on userName stored in webinarRegister
            Optional<UserInfoDB> userInfoDB = lmsDaoInterf.getUserInfo(webinarRegister.getUsername().trim());
            if(userInfoDB.isPresent()){
                studentId = userInfoDB.get().getUserDetailsId();
            }

            //here checking if the webinar exists in DB or not
            if(fetchedWebinarInfo.isPresent()) {

                // Prevent duplicate registration
                if (lmsDaoInterf.webinarRegistrationExists(webinarRegister.getUsername().trim(), webinarRegister.getWebinarInfoId())) {
                    responseMap.put("message", "You are already registered for this webinar.");
                    responseMap.put("status", Boolean.FALSE);
                    return ResponseEntity.badRequest().body(responseMap);
                }

                //setting data members
                //setting studentId in createdBy as student who has logged will be registering for webinar
                webinarRegister.setCreatedBy(studentId);

                //setting webinarRegDateTime at the time of registration
                webinarRegister.setWebinarRegDateTime(LocalDateTime.now());
                webinarRegister.setCreationTimeStamp(LocalDateTime.now());
                webinarRegister.setIsActive(Boolean.TRUE);

                Boolean isSave = lmsDaoInterf.registerWebinar(webinarRegister);

                //checking if the registration is saved or not
                if (isSave) {

                    //since registration is successful so updating the number of registration in webinarInfo by 1
                    fetchedWebinarInfo.get().setWebinarRegistrations(fetchedWebinarInfo.get().getWebinarRegistrations() == null ? 1 : fetchedWebinarInfo.get().getWebinarRegistrations() + 1);
                    Boolean isRegisterUpdated = lmsDaoInterf.saveWebinarInfo(fetchedWebinarInfo.get());

                    //here checking if webinarRegistration is successfully updated or not
                    if (isRegisterUpdated) {

                        responseMap.put("message", "Registration done Successfully");
                        responseMap.put("status", Boolean.TRUE);
                        return ResponseEntity.ok(responseMap);

                        } else {

                        responseMap.put("message", "Failed to update number of registration.");
                        responseMap.put("status", Boolean.FALSE);
                        return ResponseEntity.badRequest().body(responseMap);

                        }

                } else {

                    responseMap.put("message", "Failed to Register");
                    responseMap.put("status", Boolean.FALSE);
                    return ResponseEntity.badRequest().body(responseMap);
                }
            }
            else{

                responseMap.put("message","webinar Details of given ID not present in DB");
                responseMap.put("status",Boolean.FALSE);
                return ResponseEntity.badRequest().body(responseMap);
            }

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service Layer method to fetch list of registered webinars
    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> fetchRegisteredWebinars(String username, int page, int size) {

        HashMap<String,Object> responseMap = new HashMap<>();
        ArrayList<Map<String, Object>> webinarInfoList = new ArrayList<>();

        try{
            Pageable pageable = PageRequest.of(page, size);

            Page<Long> webinarRegisteredInfoIdsPage = lmsDaoInterf.fetchRegisteredWebinarInfoIds(username,pageable).orElseGet(Page::empty);

            List<Long> webinarRegisteredList = webinarRegisteredInfoIdsPage.getContent();

            webinarRegisteredList.forEach(webinarRegistered ->{

                Optional<WebinarInfo> webinarInfo = lmsDaoInterf.fetchActiveWebinarInfoById(webinarRegistered);

                if(webinarInfo.isPresent()){
                    webinarInfoList.add(mapWebinarInfoResponse(webinarInfo.get()));

                    webinarInfoList.trimToSize();
                }

//                webinarInfo.ifPresent(webinarInfoList::add);
//                webinarInfoList.trimToSize();
            });

            responseMap.put("data", webinarInfoList);
            responseMap.put("currentPage",page);
            responseMap.put("pageSize",size);
            responseMap.put("totalPages", webinarRegisteredInfoIdsPage.getTotalPages());
            return ResponseEntity.ok(responseMap);

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service Layer method to fetch list of students registered for a webinar(for Admin Side)
    @Override
    public ResponseEntity<Map<String, Object>> fetchStudentsRegisteredForWebinar(Long webinarInfoId) {

        HashMap<String ,Object> responseMap = new HashMap<>();

        try{
            //fetching list of registered student Ids
            List<WebinarRegister> registeredStudents = lmsDaoInterf.fetchRegisteredStudents(webinarInfoId).orElseGet(Collections::emptyList);

            ArrayList<Optional<UserInfoDB>> registeredStudentsList = new ArrayList<>();

            if(!registeredStudents.isEmpty()) {
                //iterating over list of registeredStudents Object to find and save student details in registeredStudentsList
                registeredStudents.forEach(student -> {

                    //fetching student details based on userDetailsId
                    Optional<UserInfoDB> userInfoDB = lmsDaoInterf.getUserInfo(student.getUsername());

                    if (userInfoDB.isPresent()) {
                        registeredStudentsList.add(userInfoDB);
                    }

                });

                responseMap.put("data", registeredStudentsList);
                return ResponseEntity.ok(responseMap);
            }else {

                responseMap.put("message","Webinar details not present in DB");
                return ResponseEntity.badRequest().body(responseMap);

            }


        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service Layer method to fetch list of students who attended a webinar(for Admin Side)
    @Override
    public ResponseEntity<Map<String, Object>> fetchStudentsAttendanceForWebinar(Long webinarInfoId) {

        HashMap<String ,Object> responseMap = new HashMap<>();

        try{
            //fetching list of attended student
            List<WebinarAttended> attendedStudents = lmsDaoInterf.fetchAttendedStudents(webinarInfoId).orElseGet(Collections::emptyList);

            ArrayList<Optional<UserInfoDB>> attendedStudentsList = new ArrayList<>();

            if(!attendedStudents.isEmpty()) {
                //iterating over list of attendedStudents Object to find and save student details in attendedStudentsList
                attendedStudents.forEach(student -> {

                    //fetching student details based on userDetailsId
                    Optional<UserInfoDB> userInfoDB = lmsDaoInterf.getUserInfo(student.getUsername());

                    if (userInfoDB.isPresent()) {
                        attendedStudentsList.add(userInfoDB);
                    }

                });

                responseMap.put("data", attendedStudentsList);
                return ResponseEntity.ok(responseMap);
            }else {

                responseMap.put("message","Webinar details not present in DB");
                return ResponseEntity.badRequest().body(responseMap);

            }


        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service Layer method to join in a webinar
    @Override
    public ResponseEntity<Map<String, Object>> joinWebinar(WebinarAttended webinarAttended) {
        HashMap<String ,Object> responseMap = new HashMap<>();

        try{
            //fetching webinar info details based on the webinar_info_id sent from client side
            Optional<WebinarInfo> fetchedWebinarInfo = lmsDaoInterf.fetchActiveWebinarInfoById(webinarAttended.getWebinarInfoId());

            Long studentId = 0L;
            //fetching userDetailsId based on username stored in webinarAttended
            Optional<UserInfoDB> userInfoDB = lmsDaoInterf.getUserInfo(webinarAttended.getUsername().trim());
            if(userInfoDB.isPresent()){
                studentId = userInfoDB.get().getUserDetailsId();
            }

            Optional<WebinarAttended> alreadyAttended = lmsDaoInterf.alreadyAttendedWebinar(webinarAttended.getUsername(), webinarAttended.getWebinarInfoId());

            if(alreadyAttended.isEmpty()) {
                //here checking if the webinar exists in DB or not
                if (fetchedWebinarInfo.isPresent()) {

                    //setting data members
                    //setting studentId in createdBy as student who has logged in will be attending the webinar
                    webinarAttended.setCreatedBy(studentId);
                    webinarAttended.setCreationTimeStamp(LocalDateTime.now());

                    Boolean isSave = lmsDaoInterf.joinWebinar(webinarAttended);
                    if (isSave) {
                        //here handling successful saving of webinar Details in webinar_attendance table
                        responseMap.put("message", "Webinar Joined successfully");
                        responseMap.put("status", Boolean.TRUE);
                        return ResponseEntity.ok(responseMap);

                    } else {
                        //here handling unsuccessful saving of webinar Details in webinar_attendance table
                        responseMap.put("message", "Unable to join Webinar");
                        responseMap.put("status", Boolean.FALSE);
                        return ResponseEntity.badRequest().body(responseMap);
                    }
                } else {
                    responseMap.put("message", "Webinar Details not found in DB");
                    responseMap.put("status", Boolean.FALSE);
                    return ResponseEntity.badRequest().body(responseMap);
                }
            }
            else {
                responseMap.put("message", "Webinar Joined successfully");
                responseMap.put("status", Boolean.TRUE);
                return ResponseEntity.ok(responseMap);
            }
        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service layer method to list of webinars attended by student
    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> fetchAttendedWebinars(String username, int page, int size) {

        HashMap<String,Object> responseMap = new HashMap<>();
        ArrayList<Map<String, Object>> webinarInfoList = new ArrayList<>();

        try{
            Pageable pageable = PageRequest.of(page, size);

            Page<Long> webinarAttendedInfoIdsPage = lmsDaoInterf.fetchAttendedWebinarsInfoIds(username,pageable).orElseGet(Page::empty);

            List<Long> webinarAttendedList = webinarAttendedInfoIdsPage.getContent();

            webinarAttendedList.forEach(webinarAttended ->{

                Optional<WebinarInfo> webinarInfo = lmsDaoInterf.fetchActiveWebinarInfoById(webinarAttended);

                if(webinarInfo.isPresent()){
                    webinarInfoList.add(mapWebinarInfoResponse(webinarInfo.get()));

                    webinarInfoList.trimToSize();
                }

//                webinarInfo.ifPresent(webinarInfoList::add);
//                webinarInfoList.trimToSize();
            });

                responseMap.put("data", webinarInfoList);
                responseMap.put("currentPage",page);
                responseMap.put("pageSize",size);
                responseMap.put("totalPages", webinarAttendedInfoIdsPage.getTotalPages());
                return ResponseEntity.ok(responseMap);

        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> fetchRecordedWebinars(String username) {
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            Set<Long> accessibleWebinarIds = Stream.concat(
                            lmsDaoInterf.fetchRegisteredWebinarInfoIds(username, Pageable.unpaged()).orElseGet(Page::empty).getContent().stream(),
                            lmsDaoInterf.fetchAttendedWebinarsInfoIds(username, Pageable.unpaged()).orElseGet(Page::empty).getContent().stream()
                    )
                    .filter(Objects::nonNull)
                    .collect(Collectors.toCollection(LinkedHashSet::new));

            List<WebinarInfo> recordedWebinars = webinarInfoRepo.findByIsActiveTrueOrderByCreationTimeStampDesc(Pageable.unpaged()).getContent()
                    .stream()
                    .filter(webinarInfo -> accessibleWebinarIds.contains(webinarInfo.getWebinarInfoId()))
                    .filter(webinarInfo -> webinarInfo.getWebinarEndTime() != null && webinarInfo.getWebinarEndTime().isBefore(LocalDateTime.now()))
                    .sorted(Comparator.comparing(WebinarInfo::getWebinarEndTime, Comparator.nullsLast(LocalDateTime::compareTo)).reversed())
                    .toList();

            Map<Long, WebinarWatchProgress> progressMap = webinarWatchProgressRepo.findByUsername(username).stream()
                    .collect(Collectors.toMap(WebinarWatchProgress::getWebinarInfoId, progress -> progress, (first, second) -> second, LinkedHashMap::new));

            List<Map<String, Object>> webinarList = recordedWebinars.stream()
                    .map(webinarInfo -> buildRecordedWebinarResponse(webinarInfo, progressMap.get(webinarInfo.getWebinarInfoId())))
                    .toList();

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("data", webinarList);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> fetchRecordedWebinarDetails(Long webinarInfoId, String username) {
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            Optional<WebinarInfo> webinarInfo = webinarInfoRepo.fetchActiveWebinarInfoById(webinarInfoId);

            if (webinarInfo.isEmpty()) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "Recorded webinar not found");
                return ResponseEntity.badRequest().body(responseMap);
            }

            WebinarWatchProgress progress = webinarWatchProgressRepo.findByUsernameAndWebinarInfoId(username, webinarInfoId).orElse(null);
            responseMap.put("status", Boolean.TRUE);
            responseMap.put("data", buildRecordedWebinarResponse(webinarInfo.get(), progress));
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    @Override
    public ResponseEntity<Map<String, Object>> saveWebinarProgress(WebinarWatchProgress webinarWatchProgress) {
        HashMap<String, Object> responseMap = new HashMap<>();

        try {
            if (webinarWatchProgress.getWebinarInfoId() == null || webinarWatchProgress.getUsername() == null || webinarWatchProgress.getUsername().isBlank()) {
                responseMap.put("status", Boolean.FALSE);
                responseMap.put("message", "webinarInfoId and username are required");
                return ResponseEntity.unprocessableEntity().body(responseMap);
            }

            Optional<UserInfoDB> userInfoDB = lmsDaoInterf.getUserInfo(webinarWatchProgress.getUsername().trim());
            Long studentId = userInfoDB.map(UserInfoDB::getUserDetailsId).orElse(0L);

            WebinarWatchProgress existingProgress = webinarWatchProgressRepo
                    .findByUsernameAndWebinarInfoId(webinarWatchProgress.getUsername().trim(), webinarWatchProgress.getWebinarInfoId())
                    .orElseGet(WebinarWatchProgress::new);

            if (existingProgress.getWebinarWatchProgressId() == null) {
                existingProgress.setWebinarInfoId(webinarWatchProgress.getWebinarInfoId());
                existingProgress.setUsername(webinarWatchProgress.getUsername().trim());
                existingProgress.setCreatedBy(studentId);
            }

            double watchedSeconds = Optional.ofNullable(webinarWatchProgress.getWatchedSeconds()).orElse(0.0);
            double totalDurationSeconds = Optional.ofNullable(webinarWatchProgress.getTotalDurationSeconds()).orElse(0.0);
            boolean completed = Boolean.TRUE.equals(webinarWatchProgress.getCompleted())
                    || (totalDurationSeconds > 0 && watchedSeconds >= totalDurationSeconds * 0.95);

            existingProgress.setWatchedSeconds(watchedSeconds);
            existingProgress.setTotalDurationSeconds(totalDurationSeconds);
            existingProgress.setCompleted(completed);
            existingProgress.setUpdatedBy(studentId);

            WebinarWatchProgress savedProgress = webinarWatchProgressRepo.save(existingProgress);

            responseMap.put("status", Boolean.TRUE);
            responseMap.put("message", "Progress saved successfully");
            responseMap.put("data", savedProgress);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            logger.catching(e);
            logger.error(e.fillInStackTrace());
            responseMap.put("status", Boolean.FALSE);
            responseMap.put("exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }

    //service layer to toggleWebinarActiveStatus(admin side)
    @Override
    public ResponseEntity<Map<String, Object>> toggleWebinarActiveStatus(Long webinarInfoId, Boolean status) {

         HashMap<String ,Object> responseMap = new HashMap<>();

         try{
             Optional<WebinarInfo> fetchedWebinarInfo = lmsDaoInterf.fetchAllWebinarInfoById(webinarInfoId);

             if(fetchedWebinarInfo.isPresent()){

                 //setting Active status
                 fetchedWebinarInfo.get().setIsActive(status);

                 Boolean isWebinarInfoSaved = lmsDaoInterf.saveWebinarInfo(fetchedWebinarInfo.get());

                 if(isWebinarInfoSaved){

                     responseMap.put("message","Active status toggled successfully");
                     responseMap.put("status",Boolean.TRUE);
                     return ResponseEntity.ok(responseMap);
                 }else{

                     responseMap.put("message","Error while toggling Active status of webinar");
                     responseMap.put("status",Boolean.FALSE);
                     return ResponseEntity.badRequest().body(responseMap);
                 }
             }else{
                 //here handling the case of webinar not found for the provided webinarInfoId
                 responseMap.put("message","webinar with the given ID doesn't exist in DB");
                 responseMap.put("status",Boolean.FALSE);
                 return ResponseEntity.unprocessableEntity().body(responseMap);
             }


         }catch (Exception e){
             logger.catching(e);
             logger.error(e.fillInStackTrace());

             responseMap.put("Exception", e.getMessage());
             return ResponseEntity.internalServerError().body(responseMap);
         }
    }


    //service Layer method to fetch list of webinars from today
    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String,Object>> fetchAllWebinarsFromToday(int page, int size, Optional<Long> subjectId) {

        HashMap<String,Object> responseMap = new HashMap<>();

        try{
            Pageable pageable = PageRequest.of(page, size);

            Page<WebinarInfo> webinarInfoPage = lmsDaoInterf.fetchWebinarSchedules(LocalDateTime.now(), pageable, subjectId.orElse(null)).orElseGet(Page::empty);

            //fetching list of webinarInfo
            List<WebinarInfo> webinarInfoList = webinarInfoPage.getContent();

            //here checking if webinarInfoList is empty or not
            if(!webinarInfoList.isEmpty()){

                List<Map<String, Object>> webinarFinalList = webinarInfoList.stream()
                        .map(this::mapWebinarInfoResponse)
                        .collect(Collectors.toList());

                responseMap.put("data", webinarFinalList);
                responseMap.put("currentPage",page);
                responseMap.put("pageSize",size);
                responseMap.put("totalPages",webinarInfoPage.getTotalPages());
                return ResponseEntity.ok(responseMap);

            }else{

                //here handling the case when webinarEntityList is empty
                responseMap.put("data", Collections.emptyList());
                responseMap.put("currentPage", page);
                responseMap.put("pageSize", size);
                responseMap.put("totalPages", 0);
                return ResponseEntity.ok(responseMap);

            }

        }catch (Exception e){
            logger.catching(e);
            logger.error(e.fillInStackTrace());

            responseMap.put("Exception", e.getMessage());
            return ResponseEntity.internalServerError().body(responseMap);
        }
    }
}
