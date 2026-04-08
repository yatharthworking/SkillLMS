function createDateFromParts(parts = []) {
  const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = parts.map(Number);

  if ([year, month, day].some(Number.isNaN)) {
    return null;
  }

  return new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1000000));
}

export function parseDateTime(dateTimeValue) {
  if (!dateTimeValue) {
    return null;
  }

  if (dateTimeValue instanceof Date) {
    return Number.isNaN(dateTimeValue.getTime()) ? null : dateTimeValue;
  }

  if (Array.isArray(dateTimeValue)) {
    return createDateFromParts(dateTimeValue);
  }

  const normalizedValue = String(dateTimeValue).trim();
  const nativeDate = new Date(normalizedValue);
  if (!Number.isNaN(nativeDate.getTime())) {
    return nativeDate;
  }

  const [datePart, timePart = "00:00"] = normalizedValue.split(" ");
  if (!datePart) {
    return null;
  }

  const dateSegments = datePart.split("-").map(Number);
  const timeSegments = timePart.split(":").map(Number);

  if (dateSegments.some(Number.isNaN) || timeSegments.some(Number.isNaN)) {
    return null;
  }

  const [first, second, third] = dateSegments;
  const [hour = 0, minute = 0, secondValue = 0] = timeSegments;

  if (String(datePart.split("-")[0]).length === 4) {
    return new Date(first, second - 1, third, hour, minute, secondValue);
  }

  return new Date(third, second - 1, first, hour, minute, secondValue);
}

export function parseDate(dateValue) {
  if (!dateValue) {
    return null;
  }

  if (dateValue instanceof Date) {
    return Number.isNaN(dateValue.getTime()) ? null : dateValue;
  }

  if (Array.isArray(dateValue)) {
    return createDateFromParts(dateValue);
  }

  const normalizedValue = String(dateValue).trim();
  const nativeDate = new Date(normalizedValue);
  if (!Number.isNaN(nativeDate.getTime())) {
    return nativeDate;
  }

  const dateSegments = normalizedValue.split("-").map(Number);
  if (dateSegments.some(Number.isNaN)) {
    return null;
  }

  const [first, second, third] = dateSegments;

  if (String(normalizedValue.split("-")[0]).length === 4) {
    return new Date(first, second - 1, third);
  }

  return new Date(third, second - 1, first);
}

export function formatDate(dateValue) {
  const parsedDate = parseDate(dateValue);
  if (!parsedDate) {
    return "-";
  }

  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatTime(dateTimeValue) {
  const parsedDate = parseDateTime(dateTimeValue);
  if (!parsedDate) {
    return "-";
  }

  return parsedDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTimeRange(startTime, endTime) {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

export function getWebinarImageSrc(imageValue, fallbackImage) {
  if (!imageValue) {
    return fallbackImage;
  }

  const normalizedValue = String(imageValue).trim();

  if (
    normalizedValue.startsWith("data:image") ||
    normalizedValue.startsWith("http://") ||
    normalizedValue.startsWith("https://") ||
    normalizedValue.startsWith("blob:")
  ) {
    return normalizedValue;
  }

  return `data:image/png;base64,${normalizedValue}`;
}

export function getSpeakerNames(speakers = []) {
  if (!Array.isArray(speakers)) {
    return "";
  }

  return speakers
    .map((speaker) => speaker?.name || "")
    .filter(Boolean)
    .join(", ");
}

export function getSubjectName(webinar) {
  return webinar?.subjectName || webinar?.subject || webinar?.webinarSubject || "-";
}

export function getRegistrationFeeLabel(webinar) {
  const price = Number(webinar?.webinarRegPrice ?? 0);

  if (price === 0) {
    return "Free Registration";
  }

  const normalizedCurrency = String(webinar?.currency || "").toUpperCase();

  if (normalizedCurrency === "USD") {
    return `$ ${price}`;
  }

  if (normalizedCurrency === "EUR") {
    return `EUR ${price}`;
  }

  return `\u20B9 ${price}`;
}

export function getRegistrationStatus(webinar) {
  const now = new Date();
  const webinarEndTime = parseDateTime(webinar?.webinarEndTime);
  const registrationStart = parseDateTime(webinar?.webinarRegStartTime);
  const registrationEnd = parseDateTime(webinar?.webinarRegEndTime);

  if (webinarEndTime && now >= webinarEndTime) {
    return {
      code: "expired",
      label: "Expired",
      canRegister: false,
    };
  }

  if (registrationEnd && now >= registrationEnd) {
    return {
      code: "closed",
      label: "Registration Closed",
      canRegister: false,
    };
  }

  if (registrationStart && now < registrationStart) {
    return {
      code: "upcoming",
      label: "Registration Opens Soon",
      canRegister: false,
    };
  }

  if (registrationEnd) {
    const timeDiff = registrationEnd.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return {
      code: "open",
      label: daysDiff <= 0 ? "Closes Today" : `Closes in ${daysDiff} days`,
      canRegister: true,
    };
  }

  return {
    code: "open",
    label: "Registration Open",
    canRegister: true,
  };
}

export function getJoinButtonLabel(startTime, endTime) {
  const webinarStart = parseDateTime(startTime);
  const webinarEnd = parseDateTime(endTime);
  const now = new Date();

  if (webinarEnd && now >= webinarEnd) {
    return "Expired";
  }

  if (webinarStart && now >= webinarStart) {
    return "Join Now";
  }

  if (!webinarStart) {
    return "Join Webinar";
  }

  const timeDiff = webinarStart.getTime() - now.getTime();
  const totalMinutes = Math.max(1, Math.floor(timeDiff / (1000 * 60)));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  const parts = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes}m`);
  }

  return `Join In ${parts.join(" ")}`;
}

export function isJoinDisabled(startTime) {
  const webinarStart = parseDateTime(startTime);

  if (!webinarStart) {
    return false;
  }

  return new Date() < webinarStart;
}
