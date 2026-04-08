import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ContentLibraryHub.css";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import SmartDisplayRoundedIcon from "@mui/icons-material/SmartDisplayRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const RESOURCE_STORAGE_KEY = "student-content-library-state";
const SAMPLE_PDF_URL = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
const SAMPLE_VIDEO_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const RESOURCE_CATEGORIES = [
  { id: "all", label: "All", icon: BookmarkRoundedIcon },
  { id: "book", label: "Books", icon: AutoStoriesRoundedIcon },
  { id: "video", label: "Videos", icon: SmartDisplayRoundedIcon },
  { id: "simulation", label: "Simulations", icon: ScienceRoundedIcon },
];

const RESOURCES = [
  {
    id: "r1",
    type: "book",
    title: "Physics Formula Handbook",
    subject: "Physics",
    description: "Quick revision notes for mechanics, work-energy, and motion formulas.",
    actionLabel: "Read",
    resourceUrl: SAMPLE_PDF_URL,
    downloadable: true,
    recommended: true,
  },
  {
    id: "r2",
    type: "video",
    title: "Chemical Bonding Visual Lesson",
    subject: "Chemistry",
    description: "Watch a concise explanation of ionic, covalent, and metallic bonding.",
    actionLabel: "Watch",
    resourceUrl: SAMPLE_VIDEO_URL,
    recommended: true,
  },
  {
    id: "r3",
    type: "simulation",
    title: "Projectile Motion Lab",
    subject: "Physics",
    description: "Experiment with angle, speed, and gravity in an interactive simulation.",
    actionLabel: "Open",
    resourceUrl: "https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html",
  },
  {
    id: "r4",
    type: "book",
    title: "Organic Chemistry Starter Notes",
    subject: "Chemistry",
    description: "Foundational notes covering nomenclature, hydrocarbons, and reactions.",
    actionLabel: "Read",
    resourceUrl: SAMPLE_PDF_URL,
    downloadable: true,
  },
  {
    id: "r5",
    type: "video",
    title: "Quadratic Equations Sprint",
    subject: "Mathematics",
    description: "A guided problem-solving walkthrough for quadratic equations and roots.",
    actionLabel: "Watch",
    resourceUrl: SAMPLE_VIDEO_URL,
  },
  {
    id: "r6",
    type: "simulation",
    title: "Acid-Base Virtual Titration",
    subject: "Chemistry",
    description: "Practice virtual titration steps with live pH and volume feedback.",
    actionLabel: "Open",
    resourceUrl: "https://phet.colorado.edu/",
  },
];

const getTypeMeta = (type) => {
  if (type === "book") return { icon: AutoStoriesRoundedIcon, label: "Book" };
  if (type === "video") return { icon: SmartDisplayRoundedIcon, label: "Video" };
  return { icon: ScienceRoundedIcon, label: "Simulation" };
};

export default function ContentLibraryHub() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [viewerResource, setViewerResource] = useState(null);
  const [libraryState, setLibraryState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RESOURCE_STORAGE_KEY) || "{\"bookmarks\":{},\"recent\":[]}");
    } catch (error) {
      return { bookmarks: {}, recent: [] };
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsLoading(false), 650);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    localStorage.setItem(RESOURCE_STORAGE_KEY, JSON.stringify(libraryState));
  }, [libraryState]);

  const subjects = Array.from(new Set(RESOURCES.map((resource) => resource.subject)));

  const filteredResources = RESOURCES.filter((resource) => {
    const matchesCategory = activeCategory === "all" || resource.type === activeCategory;
    const matchesSubject = selectedSubject === "all" || resource.subject === selectedSubject;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      resource.title.toLowerCase().includes(query) ||
      resource.subject.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query);

    return matchesCategory && matchesSubject && matchesSearch;
  });

  const recentResources = useMemo(
    () =>
      libraryState.recent
        .map((resourceId) => RESOURCES.find((resource) => resource.id === resourceId))
        .filter(Boolean)
        .slice(0, 3),
    [libraryState.recent]
  );

  const bookmarkedResources = useMemo(
    () => RESOURCES.filter((resource) => libraryState.bookmarks?.[resource.id]).slice(0, 3),
    [libraryState.bookmarks]
  );

  const recommendedResources = RESOURCES.filter((resource) => resource.recommended).slice(0, 3);

  const resetFilters = () => {
    setActiveCategory("all");
    setSearchQuery("");
    setSelectedSubject("all");
  };

  const handleOpenResource = (resource) => {
    setViewerResource(resource);
    setLibraryState((currentValue) => ({
      ...currentValue,
      recent: [resource.id, ...currentValue.recent.filter((resourceId) => resourceId !== resource.id)].slice(0, 8),
    }));
  };

  const toggleBookmark = (resourceId) => {
    setLibraryState((currentValue) => ({
      ...currentValue,
      bookmarks: {
        ...currentValue.bookmarks,
        [resourceId]: !currentValue.bookmarks?.[resourceId],
      },
    }));
  };

  return (
    <div className="contentLibraryHub">
      <div className="contentLibraryHero">
        <button type="button" className="contentLibraryBackButton" onClick={() => navigate(-1)}>
          <ArrowBackRoundedIcon fontSize="small" />
          <span>Back</span>
        </button>
        <span className="contentLibraryEyebrow">Learning Resources</span>
        <h1>Content Library</h1>
        <p>Discover books, videos, and simulations that support revision, concept clarity, and self-paced learning.</p>
      </div>

      <div className="contentLibraryToolbar">
        <div className="contentLibrarySearchBox">
          <SearchRoundedIcon fontSize="small" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search resources by title or subject"
          />
        </div>

        <div className="contentLibraryFilters">
          <select value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)}>
            <option value="all">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          <button type="button" className="contentLibraryGhostButton contentLibraryResetButton" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </div>

      <div className="contentLibraryOverviewGrid">
        <button type="button" className="contentLibraryOverviewCard" onClick={() => setActiveCategory("book")}>
          <strong>{RESOURCES.filter((resource) => resource.type === "book").length}</strong>
          <span>Books</span>
        </button>
        <button type="button" className="contentLibraryOverviewCard" onClick={() => setActiveCategory("video")}>
          <strong>{RESOURCES.filter((resource) => resource.type === "video").length}</strong>
          <span>Videos</span>
        </button>
        <button type="button" className="contentLibraryOverviewCard" onClick={() => setActiveCategory("simulation")}>
          <strong>{RESOURCES.filter((resource) => resource.type === "simulation").length}</strong>
          <span>Simulations</span>
        </button>
        <button type="button" className="contentLibraryOverviewCard" onClick={() => {
          setActiveCategory("all");
          setSearchQuery("");
          setSelectedSubject("all");
        }}>
          <strong>{filteredResources.length}</strong>
          <span>Visible resources</span>
        </button>
      </div>

      <div className="contentLibraryTabs">
        {RESOURCE_CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              type="button"
              className={activeCategory === category.id ? "active" : ""}
              onClick={() => setActiveCategory(category.id)}
            >
              <Icon fontSize="small" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      <div className="contentLibrarySections">
        <div className="contentLibrarySection">
          <div className="contentLibrarySectionTitle">Recommended</div>
          <div className="contentLibraryMiniGrid">
            {recommendedResources.map((resource) => {
              const TypeIcon = getTypeMeta(resource.type).icon;
              return (
                <button key={resource.id} type="button" className="contentLibraryMiniCard" onClick={() => handleOpenResource(resource)}>
                  <TypeIcon fontSize="small" />
                  <strong>{resource.title}</strong>
                  <span>{resource.subject}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="contentLibrarySection">
          <div className="contentLibrarySectionTitle">Recently Viewed</div>
          <div className="contentLibraryMiniGrid">
            {recentResources.length > 0 ? (
              recentResources.map((resource) => {
                const TypeIcon = getTypeMeta(resource.type).icon;
                return (
                  <button key={resource.id} type="button" className="contentLibraryMiniCard" onClick={() => handleOpenResource(resource)}>
                    <TypeIcon fontSize="small" />
                    <strong>{resource.title}</strong>
                    <span>{resource.subject}</span>
                  </button>
                );
              })
            ) : (
              <div className="contentLibraryEmptyState compact">Open a resource and it will appear here for quick access.</div>
            )}
          </div>
        </div>

        <div className="contentLibrarySection">
          <div className="contentLibrarySectionTitle">Bookmarked</div>
          <div className="contentLibraryMiniGrid">
            {bookmarkedResources.length > 0 ? (
              bookmarkedResources.map((resource) => {
                const TypeIcon = getTypeMeta(resource.type).icon;
                return (
                  <button key={resource.id} type="button" className="contentLibraryMiniCard" onClick={() => handleOpenResource(resource)}>
                    <TypeIcon fontSize="small" />
                    <strong>{resource.title}</strong>
                    <span>{resource.subject}</span>
                  </button>
                );
              })
            ) : (
              <div className="contentLibraryEmptyState compact">Bookmark resources to pin them here for faster access.</div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="contentLibraryGrid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="contentLibraryCard contentLibrarySkeleton"></div>
          ))}
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="contentLibraryGrid">
          {filteredResources.map((resource) => {
            const typeMeta = getTypeMeta(resource.type);
            const TypeIcon = typeMeta.icon;
            return (
              <div key={resource.id} className="contentLibraryCard">
                <div className="contentLibraryCardHeader">
                  <div className="contentLibraryTypeChip">
                    <TypeIcon fontSize="small" />
                    <span>{typeMeta.label}</span>
                  </div>
                  <button
                    type="button"
                    className={`contentLibraryBookmark ${libraryState.bookmarks?.[resource.id] ? "active" : ""}`}
                    onClick={() => toggleBookmark(resource.id)}
                  >
                    <BookmarkRoundedIcon fontSize="small" />
                  </button>
                </div>

                <div className="contentLibraryCardTitle">{resource.title}</div>
                <div className="contentLibraryCardMeta">{resource.subject}</div>
                <div className="contentLibraryCardDescription">{resource.description}</div>

                <div className="contentLibraryCardActions">
                  <button type="button" className="contentLibraryPrimaryButton" onClick={() => handleOpenResource(resource)}>
                    {resource.actionLabel}
                  </button>
                  {resource.downloadable ? (
                    <a href={resource.resourceUrl} download target="_blank" rel="noreferrer" className="contentLibraryGhostButton">
                      Download
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="contentLibraryEmptyState">No resources match your current search and filters.</div>
      )}

      {viewerResource ? (
        <div className="contentLibraryModalShell">
          <div className="contentLibraryModalBackdrop" onClick={() => setViewerResource(null)}></div>
          <div className="contentLibraryModalCard">
            <div className="contentLibraryModalHeader">
              <div>
                <div className="contentLibraryCardTitle">{viewerResource.title}</div>
                <div className="contentLibraryCardMeta">{viewerResource.subject} • {getTypeMeta(viewerResource.type).label}</div>
              </div>
              <div className="contentLibraryModalActions">
                {viewerResource.type !== "simulation" ? (
                  <a href={viewerResource.resourceUrl} target="_blank" rel="noreferrer" className="contentLibraryGhostButton">
                    Open In New Tab
                  </a>
                ) : null}
                {viewerResource.downloadable ? (
                  <a href={viewerResource.resourceUrl} download target="_blank" rel="noreferrer" className="contentLibraryGhostButton">
                    Download
                  </a>
                ) : null}
                <button type="button" className="contentLibraryGhostButton" onClick={() => toggleBookmark(viewerResource.id)}>
                  {libraryState.bookmarks?.[viewerResource.id] ? "Bookmarked" : "Bookmark"}
                </button>
                <button type="button" className="contentLibraryGhostButton" onClick={() => setViewerResource(null)}>
                  Close
                </button>
              </div>
            </div>

            <div className="contentLibraryViewer">
              {viewerResource.type === "book" ? (
                <iframe title="book-viewer" src={viewerResource.resourceUrl} className="contentLibraryFrame"></iframe>
              ) : null}

              {viewerResource.type === "video" ? (
                <video controls controlsList="nodownload" className="contentLibraryVideo">
                  <source src={viewerResource.resourceUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : null}

              {viewerResource.type === "simulation" ? (
                <div className="contentLibrarySimulationPanel">
                  <div className="contentLibraryCardDescription">
                    This simulation opens as an interactive external module so you can experiment in a full window.
                  </div>
                  <button
                    type="button"
                    className="contentLibraryPrimaryButton"
                    onClick={() => window.open(viewerResource.resourceUrl, "_blank", "noopener,noreferrer")}
                  >
                    Launch Simulation
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
