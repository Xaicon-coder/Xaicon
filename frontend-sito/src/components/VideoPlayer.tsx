import { useRef, useEffect, useCallback, useState } from "react";
import {
  ArrowLeft, SkipForward, Languages, X, Volume2, VolumeX,
  Maximize, Minimize, Play, Pause, SkipBack, ChevronLeft, ChevronRight,
  Monitor, PictureInPicture2, Moon, Gauge, List
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { saveProgress, getProgress } from "@/hooks/useWatchProgress";
import type { Anime, Season, Episode } from "@/data/animeData";
import { getVideoPath } from "@/data/animeData";

interface SkipSegment {
  type: "intro" | "outro" | "recap";
  start: number;
  end: number;
  label: string;
}

interface SubtitleTrack {
  lang: string;
  label: string;
  src: string;
}

interface SubtitleSettings {
  size: "small" | "normal" | "large" | "xlarge";
  font: string;
  color: string;
  background: "none" | "semi" | "opaque";
}

const SUBTITLE_SIZES = { small: "1rem", normal: "1.4rem", large: "1.8rem", xlarge: "2.4rem" };
const SUBTITLE_FONTS = ["Arial", "Comic Sans MS", "Courier New", "Georgia"];
const SUBTITLE_COLORS = [
  { label: "Bianco", value: "white" },
  { label: "Giallo", value: "yellow" },
  { label: "Verde", value: "lime" },
  { label: "Ciano", value: "cyan" },
];
const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const SUB_SETTINGS_KEY = "anistream-sub-settings";
const SPEED_KEY = "anistream-playback-speed";

function loadSubSettings(): SubtitleSettings {
  try {
    return JSON.parse(localStorage.getItem(SUB_SETTINGS_KEY) || "null") || { size: "normal", font: "Arial", color: "white", background: "semi" };
  } catch { return { size: "normal", font: "Arial", color: "white", background: "semi" }; }
}

function loadSpeed(): number {
  return parseFloat(localStorage.getItem(SPEED_KEY) || "1") || 1;
}

function getSubtitleTracks(anime: Anime, season: Season, episode: Episode): SubtitleTrack[] {
  const basePath = `/anime/${encodeURIComponent(anime.folderName)}/${encodeURIComponent(season.folderName)}/subs`;
  const epNum = String(episode.number).padStart(2, "0");
  return [
    { lang: "it", label: "Italiano", src: `${basePath}/ep${epNum}-it.vtt` },
    { lang: "en", label: "English", src: `${basePath}/ep${epNum}-en.vtt` },
    { lang: "ja", label: "日本語", src: `${basePath}/ep${epNum}-ja.vtt` },
    { lang: "fr", label: "Français", src: `${basePath}/ep${epNum}-fr.vtt` },
  ];
}

function getSkipSegments(_episode: Episode, duration: number): SkipSegment[] {
  const segments: SkipSegment[] = [];
  if (duration > 120) segments.push({ type: "intro", start: 0, end: 90, label: "Salta intro" });
  if (duration > 180) segments.push({ type: "outro", start: duration - 90, end: duration, label: "Salta outro" });
  return segments;
}

const SKIP_KEY = "anistream-skip-segments";
function getSavedSkipSegments(animeId: string, seasonId: string, episodeId: string): SkipSegment[] | null {
  try {
    const all = JSON.parse(localStorage.getItem(SKIP_KEY) || "{}");
    return all[`${animeId}__${seasonId}__${episodeId}`] || null;
  } catch { return null; }
}

function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

interface VideoPlayerProps {
  anime: Anime;
  season: Season;
  episode: Episode;
  prevEp: Episode | null;
  nextEp: Episode | null;
  onEpisodeEnd?: () => void;
}

const VideoPlayer = ({ anime, season, episode, prevEp, nextEp, onEpisodeEnd }: VideoPlayerProps) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const autoPlayTimer = useRef<ReturnType<typeof setTimeout>>();

  const [showOverlay, setShowOverlay] = useState(true);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showEpList, setShowEpList] = useState(false);
  const [showSubSettings, setShowSubSettings] = useState(false);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [availableSubs, setAvailableSubs] = useState<SubtitleTrack[]>([]);
  const [skipSegments, setSkipSegments] = useState<SkipSegment[]>([]);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem("anistream-volume") || "1"));
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [speed, setSpeed] = useState(loadSpeed);
  const [subSettings, setSubSettings] = useState<SubtitleSettings>(loadSubSettings);
  const [showAutoPlayNext, setShowAutoPlayNext] = useState(false);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(5);
  const [buffered, setBuffered] = useState(0);

  const videoPath = getVideoPath(anime, season, episode);
  const subtitleTracks = getSubtitleTracks(anime, season, episode);

  // Check subtitle availability
  useEffect(() => {
    const checkSubs = async () => {
      const available: SubtitleTrack[] = [];
      for (const track of subtitleTracks) {
        try {
          const res = await fetch(track.src, { method: "HEAD" });
          if (res.ok) available.push(track);
        } catch {}
      }
      setAvailableSubs(available);
    };
    checkSubs();
  }, [anime.id, season.id, episode.id]);

  // Apply playback speed
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed, videoPath]);

  // Apply volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Auto fullscreen
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const goFullscreen = () => {
      try {
        if (containerRef.current?.requestFullscreen) {
          containerRef.current.requestFullscreen().catch(() => {});
        } else if ((video as any).webkitEnterFullscreen) {
          (video as any).webkitEnterFullscreen();
        }
      } catch {}
    };
    const onCanPlay = () => { goFullscreen(); video.removeEventListener("canplay", onCanPlay); };
    video.addEventListener("canplay", onCanPlay);
    return () => video.removeEventListener("canplay", onCanPlay);
  }, [videoPath]);

  // Restore progress
  useEffect(() => {
    const saved = getProgress(anime.id, season.id, episode.id);
    const video = videoRef.current;
    if (saved && video) {
      const onLoaded = () => {
        if (saved.currentTime < video.duration - 10) video.currentTime = saved.currentTime;
        video.removeEventListener("loadedmetadata", onLoaded);
      };
      video.addEventListener("loadedmetadata", onLoaded);
    }
  }, [anime.id, season.id, episode.id, videoPath]);

  // Apply subtitle styling
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const style = document.createElement("style");
    const bg = subSettings.background === "opaque" ? "rgba(0,0,0,0.9)" : subSettings.background === "semi" ? "rgba(0,0,0,0.5)" : "transparent";
    style.textContent = `
      video::cue {
        font-size: ${SUBTITLE_SIZES[subSettings.size]};
        font-family: '${subSettings.font}', sans-serif;
        color: ${subSettings.color};
        background-color: ${bg};
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, [subSettings]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    const saved = getSavedSkipSegments(anime.id, season.id, episode.id);
    setSkipSegments(saved || getSkipSegments(episode, video.duration));
    video.playbackRate = speed;
  }, [anime.id, season.id, episode.id, speed]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    setIsPlaying(!video.paused);
    saveProgress(anime.id, season.id, episode.id, video.currentTime, video.duration);

    // Buffer info
    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1));
    }

    const intro = skipSegments.find(s => s.type === "intro");
    const outro = skipSegments.find(s => s.type === "outro");
    setShowSkipIntro(!!(intro && video.currentTime >= intro.start && video.currentTime < intro.end));
    setShowSkipOutro(!!(outro && video.currentTime >= outro.start && video.currentTime < outro.end));
  }, [anime.id, season.id, episode.id, skipSegments]);

  const skipTo = useCallback((type: "intro" | "outro") => {
    const video = videoRef.current;
    const segment = skipSegments.find(s => s.type === type);
    if (video && segment) video.currentTime = segment.end;
  }, [skipSegments]);

  const goToNextEp = useCallback(() => {
    if (nextEp) navigate(`/watch/${anime.id}/${season.id}/${nextEp.id}`);
  }, [nextEp, anime.id, season.id, navigate]);

  const goToPrevEp = useCallback(() => {
    if (prevEp) navigate(`/watch/${anime.id}/${season.id}/${prevEp.id}`);
  }, [prevEp, anime.id, season.id, navigate]);

  const handleEnded = useCallback(() => {
    onEpisodeEnd?.();
    if (nextEp) {
      setShowAutoPlayNext(true);
      setAutoPlayCountdown(5);
      let count = 5;
      autoPlayTimer.current = setInterval(() => {
        count--;
        setAutoPlayCountdown(count);
        if (count <= 0) {
          clearInterval(autoPlayTimer.current);
          goToNextEp();
        }
      }, 1000);
    }
  }, [goToNextEp, onEpisodeEnd, nextEp]);

  const cancelAutoPlay = useCallback(() => {
    clearInterval(autoPlayTimer.current);
    setShowAutoPlayNext(false);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play() : video.pause();
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const changeVolume = useCallback((val: number) => {
    const v = Math.max(0, Math.min(1, val));
    setVolume(v);
    setIsMuted(v === 0);
    localStorage.setItem("anistream-volume", String(v));
  }, []);

  const changeSpeed = useCallback((s: number) => {
    setSpeed(s);
    localStorage.setItem(SPEED_KEY, String(s));
    if (videoRef.current) videoRef.current.playbackRate = s;
    setShowSpeedMenu(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current?.requestFullscreen?.().catch(() => {});
  }, []);

  const toggleTheater = useCallback(() => setTheaterMode(prev => !prev), []);
  const toggleNightMode = useCallback(() => setNightMode(prev => !prev), []);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch (e) { console.error("PiP failed:", e); }
  }, []);

  const selectSubtitle = useCallback((lang: string | null) => {
    const video = videoRef.current;
    if (!video) return;
    setActiveSub(lang);
    setShowSubMenu(false);
    for (let i = 0; i < video.textTracks.length; i++) video.textTracks[i].mode = "disabled";
    if (lang) {
      for (let i = 0; i < video.textTracks.length; i++) {
        if (video.textTracks[i].language === lang) { video.textTracks[i].mode = "showing"; break; }
      }
    }
  }, []);

  const seekTo = useCallback((fraction: number) => {
    const video = videoRef.current;
    if (video) video.currentTime = fraction * video.duration;
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seekTo((e.clientX - rect.left) / rect.width);
  }, [seekTo]);

  // Overlay visibility
  const revealOverlay = useCallback(() => {
    setShowOverlay(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setShowOverlay(false);
      setShowSubMenu(false);
      setShowSpeedMenu(false);
      setShowEpList(false);
      setShowSubSettings(false);
    }, 5000);
  }, []);

  const closeAllMenus = useCallback(() => {
    setShowSubMenu(false);
    setShowSpeedMenu(false);
    setShowEpList(false);
    setShowSubSettings(false);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const video = videoRef.current;
      switch (e.key) {
        case " ": e.preventDefault(); togglePlay(); break;
        case "f": case "F": e.preventDefault(); toggleFullscreen(); break;
        case "m": case "M": e.preventDefault(); toggleMute(); break;
        case "t": case "T": e.preventDefault(); toggleTheater(); break;
        case "n": case "N": e.preventDefault(); goToNextEp(); break;
        case "p": case "P": e.preventDefault(); goToPrevEp(); break;
        case "c": case "C":
          e.preventDefault();
          if (activeSub) selectSubtitle(null);
          else if (availableSubs.length > 0) selectSubtitle(availableSubs[0].lang);
          break;
        case "s": case "S": e.preventDefault(); setShowSubMenu(prev => !prev); break;
        case "i": case "I": e.preventDefault(); if (showSkipIntro) skipTo("intro"); break;
        case "ArrowRight":
          if (video) { e.preventDefault(); video.currentTime = Math.min(video.duration, video.currentTime + 5); }
          break;
        case "ArrowLeft":
          if (video) { e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 5); }
          break;
        case "ArrowUp":
          e.preventDefault(); changeVolume(volume + 0.1);
          break;
        case "ArrowDown":
          e.preventDefault(); changeVolume(volume - 0.1);
          break;
        case "Escape":
          if (!document.fullscreenElement) navigate(`/anime/${anime.id}`);
          break;
        default:
          // Number keys 1-9: jump to 10%-90%
          if (/^[1-9]$/.test(e.key) && video) {
            e.preventDefault();
            video.currentTime = video.duration * (parseInt(e.key) / 10);
          }
      }
      revealOverlay();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goToNextEp, goToPrevEp, revealOverlay, anime.id, navigate, showSkipIntro, skipTo, togglePlay, toggleFullscreen, toggleMute, toggleTheater, activeSub, availableSubs, selectSubtitle, volume, changeVolume]);

  // Cleanup autoplay timer
  useEffect(() => { return () => clearInterval(autoPlayTimer.current); }, []);

  const containerClass = theaterMode
    ? "w-full bg-black relative group"
    : "w-full bg-black relative group";

  const containerStyle = theaterMode
    ? { height: "calc(100vh - 4rem)" }
    : { aspectRatio: "16/9", maxHeight: "calc(100vh - 4rem)" };

  return (
    <div
      ref={containerRef}
      className={containerClass}
      style={containerStyle}
      onMouseMove={revealOverlay}
      onTouchStart={revealOverlay}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-control]")) return;
        togglePlay();
        revealOverlay();
      }}
    >
      {/* Night mode overlay */}
      {nightMode && <div className="absolute inset-0 bg-amber-900/20 pointer-events-none z-20" />}

      <video
        ref={videoRef}
        key={videoPath}
        src={videoPath}
        autoPlay
        className="w-full h-full object-contain"
        poster={episode.thumbnail}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        crossOrigin="anonymous"
      >
        {availableSubs.map((track) => (
          <track key={track.lang} kind="subtitles" src={track.src} srcLang={track.lang} label={track.label} />
        ))}
      </video>

      {/* Custom Controls Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 z-30 flex flex-col justify-between pointer-events-none animate-fade-in" data-control>
          {/* Top bar */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-auto" data-control>
            <Link to={`/anime/${anime.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 text-white/90 hover:text-white text-sm" data-control>
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">{anime.title}</span>
              <span className="opacity-60 hidden sm:inline">• S{season.number} E{episode.number}</span>
            </Link>
            <div className="flex gap-2 text-white/60 text-[10px] sm:text-xs" data-control>
              <span>Space=Play</span>
              <span>F=Fullscreen</span>
              <span>M=Mute</span>
              <span className="hidden sm:inline">C=Subs</span>
              <span className="hidden sm:inline">T=Theater</span>
            </div>
          </div>

          {/* Center play/pause indicator */}
          {!isPlaying && (
            <div className="flex items-center justify-center pointer-events-auto" data-control>
              <button onClick={togglePlay} className="bg-primary/80 backdrop-blur-sm rounded-full p-4 hover:bg-primary transition-colors" data-control>
                <Play size={32} className="text-primary-foreground" fill="currentColor" />
              </button>
            </div>
          )}

          {/* Bottom controls */}
          <div className="bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4 pointer-events-auto" data-control>
            {/* Progress bar */}
            <div ref={progressRef} className="relative h-1.5 sm:h-2 bg-white/20 rounded-full cursor-pointer mb-3 group/progress" onClick={handleProgressClick} data-control>
              {/* Buffered */}
              <div className="absolute inset-y-0 left-0 bg-white/20 rounded-full" style={{ width: `${duration > 0 ? (buffered / duration) * 100 : 0}%` }} />
              {/* Progress */}
              <div className="absolute inset-y-0 left-0 bg-primary rounded-full transition-[width] duration-100" style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }} />
              {/* Thumb */}
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg" style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, transform: "translate(-50%, -50%)" }} />
            </div>

            <div className="flex items-center justify-between gap-2" data-control>
              {/* Left controls */}
              <div className="flex items-center gap-1 sm:gap-2" data-control>
                {/* Prev */}
                <button onClick={goToPrevEp} disabled={!prevEp} className="text-white/80 hover:text-white disabled:opacity-30 p-1" data-control title="Precedente">
                  <SkipBack size={18} />
                </button>
                {/* Play/Pause */}
                <button onClick={togglePlay} className="text-white hover:text-primary p-1" data-control>
                  {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
                </button>
                {/* Next */}
                <button onClick={goToNextEp} disabled={!nextEp} className="text-white/80 hover:text-white disabled:opacity-30 p-1" data-control title="Prossimo">
                  <SkipForward size={18} />
                </button>

                {/* Volume */}
                <div className="flex items-center gap-1 group/vol" data-control>
                  <button onClick={toggleMute} className="text-white/80 hover:text-white p-1" data-control>
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => changeVolume(parseFloat(e.target.value))}
                    className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-primary h-1 cursor-pointer"
                    data-control
                  />
                </div>

                {/* Time */}
                <span className="text-white/70 text-xs sm:text-sm font-mono ml-1" data-control>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-1 sm:gap-1.5" data-control>
                {/* Speed */}
                <div className="relative" data-control>
                  <button onClick={() => { closeAllMenus(); setShowSpeedMenu(prev => !prev); }} className="text-white/70 hover:text-white p-1 text-xs font-bold" data-control title="Velocità">
                    <Gauge size={18} />
                  </button>
                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 p-1 min-w-[100px] animate-fade-in" data-control>
                      {PLAYBACK_SPEEDS.map(s => (
                        <button key={s} onClick={() => changeSpeed(s)} className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${speed === s ? "bg-primary/30 text-primary" : "text-white/80 hover:bg-white/10"}`} data-control>
                          {s}x {s === 1 && "(Normale)"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subtitles */}
                {availableSubs.length > 0 && (
                  <div className="relative" data-control>
                    <button onClick={() => { closeAllMenus(); setShowSubMenu(prev => !prev); }} className={`p-1 transition-colors ${activeSub ? "text-primary" : "text-white/70 hover:text-white"}`} data-control title="Sottotitoli (S)">
                      <Languages size={18} />
                    </button>
                    {showSubMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 p-1 min-w-[160px] animate-fade-in" data-control>
                        <div className="flex items-center justify-between px-3 py-1 mb-1">
                          <span className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Sottotitoli</span>
                          <button onClick={() => { setShowSubMenu(false); setShowSubSettings(true); }} className="text-white/50 hover:text-primary text-[10px]" data-control>⚙️</button>
                        </div>
                        <button onClick={() => selectSubtitle(null)} className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${activeSub === null ? "bg-primary/30 text-primary" : "text-white/80 hover:bg-white/10"}`} data-control>Disattivati</button>
                        {availableSubs.map(t => (
                          <button key={t.lang} onClick={() => selectSubtitle(t.lang)} className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${activeSub === t.lang ? "bg-primary/30 text-primary" : "text-white/80 hover:bg-white/10"}`} data-control>{t.label}</button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sub settings panel */}
                {showSubSettings && (
                  <div className="absolute bottom-16 right-4 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 p-4 min-w-[220px] animate-fade-in z-50" data-control onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white text-xs font-semibold">Impostazioni sottotitoli</span>
                      <button onClick={() => setShowSubSettings(false)} className="text-white/50 hover:text-white" data-control><X size={14} /></button>
                    </div>
                    {/* Size */}
                    <label className="text-white/50 text-[10px] uppercase tracking-wider block mb-1">Dimensione</label>
                    <div className="flex gap-1 mb-3">
                      {(["small", "normal", "large", "xlarge"] as const).map(s => (
                        <button key={s} onClick={() => { const next = {...subSettings, size: s}; setSubSettings(next); localStorage.setItem(SUB_SETTINGS_KEY, JSON.stringify(next)); }} className={`text-[10px] px-2 py-1 rounded ${subSettings.size === s ? "bg-primary text-white" : "bg-white/10 text-white/60"}`} data-control>
                          {s === "small" ? "S" : s === "normal" ? "M" : s === "large" ? "L" : "XL"}
                        </button>
                      ))}
                    </div>
                    {/* Font */}
                    <label className="text-white/50 text-[10px] uppercase tracking-wider block mb-1">Font</label>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {SUBTITLE_FONTS.map(f => (
                        <button key={f} onClick={() => { const next = {...subSettings, font: f}; setSubSettings(next); localStorage.setItem(SUB_SETTINGS_KEY, JSON.stringify(next)); }} className={`text-[10px] px-2 py-1 rounded ${subSettings.font === f ? "bg-primary text-white" : "bg-white/10 text-white/60"}`} style={{ fontFamily: f }} data-control>{f.split(" ")[0]}</button>
                      ))}
                    </div>
                    {/* Color */}
                    <label className="text-white/50 text-[10px] uppercase tracking-wider block mb-1">Colore</label>
                    <div className="flex gap-1 mb-3">
                      {SUBTITLE_COLORS.map(c => (
                        <button key={c.value} onClick={() => { const next = {...subSettings, color: c.value}; setSubSettings(next); localStorage.setItem(SUB_SETTINGS_KEY, JSON.stringify(next)); }} className={`w-5 h-5 rounded-full border-2 ${subSettings.color === c.value ? "border-primary" : "border-white/20"}`} style={{ backgroundColor: c.value }} title={c.label} data-control />
                      ))}
                    </div>
                    {/* Background */}
                    <label className="text-white/50 text-[10px] uppercase tracking-wider block mb-1">Sfondo</label>
                    <div className="flex gap-1">
                      {(["none", "semi", "opaque"] as const).map(bg => (
                        <button key={bg} onClick={() => { const next = {...subSettings, background: bg}; setSubSettings(next); localStorage.setItem(SUB_SETTINGS_KEY, JSON.stringify(next)); }} className={`text-[10px] px-2 py-1 rounded ${subSettings.background === bg ? "bg-primary text-white" : "bg-white/10 text-white/60"}`} data-control>
                          {bg === "none" ? "Nessuno" : bg === "semi" ? "Semi" : "Opaco"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Episode list */}
                <div className="relative" data-control>
                  <button onClick={() => { closeAllMenus(); setShowEpList(prev => !prev); }} className="text-white/70 hover:text-white p-1" data-control title="Lista episodi">
                    <List size={18} />
                  </button>
                  {showEpList && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 p-1 min-w-[180px] max-h-60 overflow-y-auto animate-fade-in" data-control>
                      <span className="text-white/50 text-[10px] font-semibold uppercase tracking-wider px-3 py-1 block">{season.title}</span>
                      {season.episodes.map(ep => (
                        <button key={ep.id} onClick={() => { navigate(`/watch/${anime.id}/${season.id}/${ep.id}`); setShowEpList(false); }}
                          className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${ep.id === episode.id ? "bg-primary/30 text-primary" : "text-white/80 hover:bg-white/10"}`} data-control>
                          Ep. {ep.number} - {ep.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Night mode */}
                <button onClick={toggleNightMode} className={`p-1 transition-colors ${nightMode ? "text-amber-400" : "text-white/70 hover:text-white"}`} data-control title="Modalità notturna">
                  <Moon size={18} />
                </button>

                {/* PiP */}
                <button onClick={togglePiP} className="text-white/70 hover:text-white p-1" data-control title="Picture in Picture">
                  <PictureInPicture2 size={18} />
                </button>

                {/* Theater */}
                <button onClick={toggleTheater} className={`p-1 transition-colors ${theaterMode ? "text-primary" : "text-white/70 hover:text-white"}`} data-control title="Modalità teatro (T)">
                  <Monitor size={18} />
                </button>

                {/* Fullscreen */}
                <button onClick={toggleFullscreen} className="text-white/70 hover:text-white p-1" data-control title="Schermo intero (F)">
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skip Intro */}
      {showSkipIntro && (
        <button onClick={(e) => { e.stopPropagation(); skipTo("intro"); }}
          className="absolute bottom-24 right-4 sm:bottom-28 sm:right-6 z-40 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg text-sm font-semibold border border-white/30 transition-all animate-fade-in flex items-center gap-2 shadow-lg" data-control>
          <SkipForward size={18} /> Salta intro
        </button>
      )}

      {/* Skip Outro / Next episode */}
      {showSkipOutro && nextEp && (
        <button onClick={(e) => { e.stopPropagation(); goToNextEp(); }}
          className="absolute bottom-24 right-4 sm:bottom-28 sm:right-6 z-40 bg-primary/80 backdrop-blur-md hover:bg-primary text-primary-foreground px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg text-sm font-semibold border border-primary/50 transition-all animate-fade-in flex items-center gap-2 shadow-lg" data-control>
          <SkipForward size={18} /> Prossimo episodio
        </button>
      )}

      {/* Auto-play next episode overlay */}
      {showAutoPlayNext && nextEp && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in" data-control onClick={e => e.stopPropagation()}>
          <div className="text-center">
            <p className="text-white/60 text-sm mb-2">Prossimo episodio tra</p>
            <p className="text-white text-5xl font-bold mb-4">{autoPlayCountdown}</p>
            <p className="text-white text-lg font-medium mb-6">Ep. {nextEp.number} - {nextEp.title}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={goToNextEp} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2" data-control>
                <Play size={18} fill="currentColor" /> Riproduci ora
              </button>
              <button onClick={cancelAutoPlay} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-lg transition-colors" data-control>
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
