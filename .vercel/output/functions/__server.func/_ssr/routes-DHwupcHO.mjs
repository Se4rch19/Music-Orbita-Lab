import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Play, i as Square, n as Volume2, o as Pause, s as Download, t as VolumeX } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DHwupcHO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-[transform,background-color,color,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.96]", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:bg-fg",
			secondary: "bg-surface-2 text-fg shadow-border hover:bg-surface",
			ghost: "bg-transparent text-fg hover:bg-surface-2",
			danger: "bg-danger text-fg hover:opacity-90"
		},
		size: {
			sm: "h-9 px-3 text-sm",
			md: "h-11 px-4 text-sm",
			lg: "h-12 px-5 text-base",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "secondary",
		size: "md"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
var WORLD_HEX = {
	menta: "#7baf9e",
	durazno: "#c4a07a",
	lavanda: "#9aa0b4",
	glaciar: "#a8b8c4",
	eclipse: "#a87878",
	procedural: "#c5cbd4",
	idle: "#c5cbd4"
};
function OrbitVisualizer({ analyser, diagnostics, theme }) {
	const canvasRef = (0, import_react.useRef)(null);
	const frameRef = (0, import_react.useRef)(0);
	const binsRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const draw = (now) => {
			const parent = canvas.parentElement;
			const width = parent?.clientWidth ?? 640;
			const height = parent?.clientHeight ?? 320;
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
				canvas.width = Math.floor(width * dpr);
				canvas.height = Math.floor(height * dpr);
				canvas.style.width = `${width}px`;
				canvas.style.height = `${height}px`;
			}
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, width, height);
			const cx = width / 2;
			const cy = height / 2;
			const color = WORLD_HEX[theme] ?? WORLD_HEX.idle;
			let energy = .12;
			if (analyser) {
				if (!binsRef.current || binsRef.current.length !== analyser.frequencyBinCount) binsRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
				analyser.getByteFrequencyData(binsRef.current);
				const bins = binsRef.current;
				let sum = 0;
				for (let i = 0; i < bins.length; i++) sum += bins[i] ?? 0;
				energy = sum / (bins.length * 255);
			}
			const beatPulse = diagnostics.running ? 1 + Math.max(0, 1 - diagnostics.currentBeat % 1) * .08 * (.4 + diagnostics.intensity) : 1;
			const t = now / 1e3;
			const maxR = Math.min(width, height) * .42;
			ctx.fillStyle = "#0b0c0e";
			ctx.fillRect(0, 0, width, height);
			const glow = ctx.createRadialGradient(cx, cy, 8, cx, cy, maxR * 1.4);
			glow.addColorStop(0, hexAlpha(color, .16 + energy * .2));
			glow.addColorStop(1, "rgba(11,12,14,0)");
			ctx.fillStyle = glow;
			ctx.fillRect(0, 0, width, height);
			for (let i = 1; i <= 4; i++) {
				const r = maxR * i / 4.2 * beatPulse;
				ctx.beginPath();
				ctx.arc(cx, cy, r, 0, Math.PI * 2);
				ctx.strokeStyle = hexAlpha("#e8e6e1", .14 + i * .03);
				ctx.lineWidth = i === 2 ? 1.6 : 1;
				ctx.stroke();
			}
			ctx.beginPath();
			ctx.arc(cx, cy, 9 + energy * 10, 0, Math.PI * 2);
			ctx.fillStyle = hexAlpha(color, .95);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(cx, cy, 18, 0, Math.PI * 2);
			ctx.strokeStyle = hexAlpha(color, .35);
			ctx.lineWidth = 1;
			ctx.stroke();
			[
				.34,
				.58,
				.82
			].forEach((frac, i) => {
				const r = maxR * frac * beatPulse;
				const speed = (.18 + i * .07) * (.7 + diagnostics.intensity);
				const angle = t * speed + i * 1.7;
				const x = cx + Math.cos(angle) * r;
				const y = cy + Math.sin(angle) * r * .98;
				ctx.beginPath();
				ctx.arc(x, y, 2.4 + (i === 0 ? 1.2 : 0), 0, Math.PI * 2);
				ctx.fillStyle = i === 0 ? "#e8e6e1" : hexAlpha(color, .85);
				ctx.fill();
			});
			if (binsRef.current) {
				const bins = binsRef.current;
				const count = 36;
				for (let i = 0; i < count; i++) {
					const mag = (bins[Math.floor(i / count * bins.length)] ?? 0) / 255;
					const ang = i / count * Math.PI * 2 - Math.PI / 2;
					const inner = maxR * .9;
					const outer = inner + mag * maxR * .18;
					ctx.beginPath();
					ctx.moveTo(cx + Math.cos(ang) * inner, cy + Math.sin(ang) * inner);
					ctx.lineTo(cx + Math.cos(ang) * outer, cy + Math.sin(ang) * outer);
					ctx.strokeStyle = hexAlpha(color, .25 + mag * .45);
					ctx.lineWidth = 2;
					ctx.stroke();
				}
			}
			frameRef.current = requestAnimationFrame(draw);
		};
		frameRef.current = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(frameRef.current);
	}, [
		analyser,
		diagnostics.running,
		diagnostics.intensity,
		diagnostics.currentBeat,
		theme
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		className: "h-full w-full",
		"aria-hidden": true
	});
}
function hexAlpha(hex, alpha) {
	const raw = hex.replace("#", "");
	const n = parseInt(raw, 16);
	return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${alpha})`;
}
var BASE_SENDS = {
	pad: .18,
	lead: .12,
	pluck: .08,
	bell: .16,
	arp: .08,
	pickup: .1,
	bass: .02,
	kick: .02,
	snare: .03
};
var MIX_EQ_V11 = {
	hipass: 62,
	mudGain: -1.6,
	presenceGain: 2.6,
	airGain: 1.6
};
/**
* Per-voice peak into the instrument bus at velocity 1.
* Sized so a typical 3–6 voice bed sits around −12 to −8 dBFS before makeup,
* not −24. Kick is the loudest transient; pads are wide but not quiet.
*/
var VOICE_PEAK = {
	pad: .36,
	bass: .52,
	lead: .4,
	pluck: .42,
	arp: .3,
	bell: .38,
	kick: .76,
	snare: .5,
	hat: .22,
	click: .24,
	noise: .1,
	pickup: .56,
	event: .36
};
var V11_SENDS = {
	pad: .22,
	lead: .16,
	pluck: .1,
	bell: .2,
	arp: .1,
	pickup: .14,
	bass: .03,
	kick: .04,
	snare: .06
};
/** Frozen v1.1 mix for A/B listening. */
var MIX_PROFILES_V11 = {
	menta: {
		makeup: 1.18,
		pad: 1.12,
		bass: 1.08,
		lead: 1.1,
		perc: 1.02,
		sfx: 1,
		space: {
			size: 1.12,
			damp: .4,
			wet: .18,
			preDelay: .016
		},
		sends: {
			...V11_SENDS,
			pad: .24,
			bell: .2
		},
		eq: MIX_EQ_V11
	},
	durazno: {
		makeup: 1.1,
		pad: .96,
		bass: 1.2,
		lead: 1.14,
		perc: 1.1,
		sfx: 1.05,
		space: {
			size: .68,
			damp: .58,
			wet: .1,
			preDelay: .006
		},
		sends: {
			...V11_SENDS,
			pad: .1,
			kick: .03,
			snare: .05,
			bass: .02
		},
		eq: MIX_EQ_V11
	},
	lavanda: {
		makeup: 1.14,
		pad: 1.1,
		bass: 1.05,
		lead: 1.14,
		perc: 1.02,
		sfx: 1.02,
		space: {
			size: 1.28,
			damp: .3,
			wet: .24,
			preDelay: .024
		},
		sends: {
			...V11_SENDS,
			pad: .28,
			pluck: .14,
			arp: .12,
			bell: .24
		},
		eq: MIX_EQ_V11
	},
	glaciar: {
		makeup: 1.28,
		pad: 1.2,
		bass: 1.08,
		lead: 1.18,
		perc: .98,
		sfx: 1.05,
		space: {
			size: 1.48,
			damp: .2,
			wet: .26,
			preDelay: .032
		},
		sends: {
			...V11_SENDS,
			pad: .32,
			bell: .3,
			pluck: .16,
			click: .14
		},
		eq: MIX_EQ_V11
	},
	eclipse: {
		makeup: 1.1,
		pad: 1.06,
		bass: 1.2,
		lead: 1.06,
		perc: 1.14,
		sfx: 1.06,
		space: {
			size: 1.18,
			damp: .48,
			wet: .15,
			preDelay: .018
		},
		sends: {
			...V11_SENDS,
			pad: .18,
			bass: .04,
			kick: .04,
			lead: .1
		},
		eq: MIX_EQ_V11
	}
};
var MIX_PROFILES = {
	menta: {
		makeup: 1.18,
		pad: 1.1,
		bass: 1.08,
		lead: 1.12,
		perc: 1,
		sfx: 1,
		space: {
			size: 1.05,
			damp: .48,
			wet: .14,
			preDelay: .014
		},
		sends: {
			...BASE_SENDS,
			pad: .18,
			bell: .16
		},
		eq: {
			hipass: 72,
			mudGain: -2.2,
			presenceGain: 1.8,
			airGain: 1.4
		}
	},
	durazno: {
		makeup: 1.1,
		pad: .94,
		bass: 1.2,
		lead: 1.14,
		perc: 1.08,
		sfx: 1.05,
		space: {
			size: .64,
			damp: .64,
			wet: .09,
			preDelay: .005
		},
		sends: {
			...BASE_SENDS,
			pad: .08,
			kick: .02,
			snare: .03,
			bass: .015
		},
		eq: {
			hipass: 78,
			mudGain: -2.8,
			presenceGain: 1.6,
			airGain: .8
		}
	},
	lavanda: {
		makeup: 1.14,
		pad: 1.08,
		bass: 1.04,
		lead: 1.14,
		perc: 1,
		sfx: 1.02,
		space: {
			size: 1.18,
			damp: .42,
			wet: .18,
			preDelay: .02
		},
		sends: {
			...BASE_SENDS,
			pad: .2,
			pluck: .1,
			arp: .08,
			bell: .18
		},
		eq: {
			hipass: 70,
			mudGain: -2.4,
			presenceGain: 1.7,
			airGain: 1.2
		}
	},
	glaciar: {
		makeup: 1.26,
		pad: 1.18,
		bass: 1.06,
		lead: 1.16,
		perc: .96,
		sfx: 1.05,
		space: {
			size: 1.36,
			damp: .34,
			wet: .2,
			preDelay: .028
		},
		sends: {
			...BASE_SENDS,
			pad: .22,
			bell: .22,
			pluck: .12,
			click: .06
		},
		eq: {
			hipass: 80,
			mudGain: -2,
			presenceGain: 1.5,
			airGain: 1.8
		}
	},
	eclipse: {
		makeup: 1.1,
		pad: 1.04,
		bass: 1.2,
		lead: 1.06,
		perc: 1.1,
		sfx: 1.06,
		space: {
			size: 1.08,
			damp: .55,
			wet: .12,
			preDelay: .016
		},
		sends: {
			...BASE_SENDS,
			pad: .14,
			bass: .02,
			kick: .02,
			lead: .08
		},
		eq: {
			hipass: 68,
			mudGain: -2.6,
			presenceGain: 1.4,
			airGain: .6
		}
	}
};
function mixProfileFor(theme, revision = "v1.2") {
	const table = revision === "v1.1" ? MIX_PROFILES_V11 : MIX_PROFILES;
	if (theme === "procedural") return {
		...table.lavanda,
		makeup: revision === "v1.1" ? 1.34 : 1.22
	};
	return table[theme];
}
function mixProfileFromDna(dna, revision = "v1.2") {
	const energy = Math.max(0, Math.min(1, dna.energy));
	const tension = Math.max(0, Math.min(1, dna.tension));
	const lum = Math.max(0, Math.min(1, dna.luminosity));
	const table = revision === "v1.1" ? MIX_PROFILES_V11 : MIX_PROFILES;
	const base = dna.harmonicColor === "warm" ? table.durazno : dna.harmonicColor === "shadow" ? table.eclipse : dna.harmonicColor === "crystal" ? table.glaciar : dna.harmonicColor === "alien" ? table.lavanda : dna.harmonicColor === "hybrid" ? table.lavanda : table.menta;
	const space = { ...dna.spaceProfile };
	if (revision !== "v1.1") {
		space.damp = Math.max(.32, Math.min(.7, space.damp + .1));
		space.wet = Math.max(.06, Math.min(.22, space.wet * .78));
	}
	return {
		...base,
		makeup: (dna.harmonicColor === "crystal" ? 1.36 : 1.22) + (1 - energy) * .08,
		bass: .98 + energy * .32,
		perc: .9 + energy * .42 + tension * .08,
		pad: 1.05 + lum * .18,
		lead: 1.08 + lum * .14,
		space,
		sends: {
			...base.sends,
			pad: .12 + space.wet * .32,
			bell: dna.harmonicColor === "crystal" || dna.harmonicColor === "alien" ? .2 : .14
		},
		eq: base.eq
	};
}
function spaceFeedback(damp) {
	return Math.min(.42, .26 + (1 - Math.max(.1, Math.min(.9, damp))) * .16);
}
/**
* Lightweight 4-delay FDN-style space. Persistent on the mixer, not per voice.
* v1.2: tighter feedback, higher HP, so tails deepen the mix without smearing the next chord.
*/
function createSpace(ctx) {
	const input = ctx.createGain();
	input.gain.value = 1;
	const output = ctx.createGain();
	output.gain.value = .16;
	const pre = ctx.createDelay(.08);
	pre.delayTime.value = .018;
	const hp = ctx.createBiquadFilter();
	hp.type = "highpass";
	hp.frequency.value = 280;
	const dampShelf = ctx.createBiquadFilter();
	dampShelf.type = "lowshelf";
	dampShelf.frequency.value = 320;
	dampShelf.gain.value = -2.5;
	input.connect(pre);
	pre.connect(hp);
	hp.connect(dampShelf);
	const times = [
		.0297,
		.0371,
		.0411,
		.0437
	];
	const delays = [];
	const filters = [];
	const feedbacks = [];
	const taps = [];
	let wet = .16;
	let fbValue = .34;
	times.forEach((t, i) => {
		const delay = ctx.createDelay(1);
		delay.delayTime.value = t * 5.2;
		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 4200;
		const fb = ctx.createGain();
		fb.gain.value = .34;
		const pan = ctx.createStereoPanner();
		pan.pan.value = i % 2 === 0 ? -.48 : .48;
		dampShelf.connect(delay);
		delay.connect(lp);
		lp.connect(fb);
		fb.connect(delay);
		lp.connect(pan);
		pan.connect(output);
		delays.push(delay);
		filters.push(lp);
		feedbacks.push(fb);
		taps.push(pan);
	});
	return {
		input,
		output,
		setProfile(profile) {
			const size = Math.max(.5, Math.min(2, profile.size));
			const damp = Math.max(.1, Math.min(.9, profile.damp));
			wet = Math.max(0, Math.min(.42, profile.wet));
			fbValue = spaceFeedback(damp);
			const now = "currentTime" in ctx ? ctx.currentTime : 0;
			pre.delayTime.value = Math.max(.004, Math.min(.06, profile.preDelay));
			output.gain.setTargetAtTime(wet, now, .05);
			hp.frequency.setTargetAtTime(260 + damp * 80, now, .05);
			dampShelf.gain.setTargetAtTime(-1.8 - damp * 1.4, now, .05);
			times.forEach((t, i) => {
				delays[i].delayTime.value = Math.min(.85, t * size * 5.6);
				filters[i].frequency.value = 2e3 + (1 - damp) * 2800;
				feedbacks[i].gain.setTargetAtTime(fbValue, now, .05);
			});
		},
		setWetScale(scale, time) {
			const now = time ?? ("currentTime" in ctx ? ctx.currentTime : 0);
			const s = Math.max(.5, Math.min(1.5, scale));
			output.gain.setTargetAtTime(wet * s, now, .08);
		},
		duck(time, seconds = .28) {
			const dur = Math.max(.12, Math.min(.6, seconds));
			output.gain.setTargetAtTime(wet * .48, time, .04);
			output.gain.setTargetAtTime(wet, time + dur, .14);
			for (const fb of feedbacks) {
				fb.gain.setTargetAtTime(fbValue * .42, time, .03);
				fb.gain.setTargetAtTime(fbValue, time + dur, .12);
			}
		},
		dispose() {
			try {
				input.disconnect();
				output.disconnect();
				pre.disconnect();
				hp.disconnect();
				dampShelf.disconnect();
				delays.forEach((n) => n.disconnect());
				filters.forEach((n) => n.disconnect());
				feedbacks.forEach((n) => n.disconnect());
				taps.forEach((n) => n.disconnect());
			} catch {}
		}
	};
}
function clamp(value) {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(1.5, value));
}
function tanhShaper(drive) {
	const n = 1024;
	const curve = new Float32Array(/* @__PURE__ */ new ArrayBuffer(n * 4));
	for (let i = 0; i < n; i++) {
		const x = i / 1023 * 2 - 1;
		curve[i] = Math.tanh(x * drive) / Math.tanh(drive);
	}
	return curve;
}
/**
* Signal path:
*   instrument buses → music / SFX
*   space return ───┘
*   → HP → mud cut → presence → air
*   → compressor (gentle glue; Web Audio also applies hidden makeup)
*   → post-comp theme makeup (near unity — do not double the compressor)
*   → dry + gentle sat
*   → limiter / safety
*   → master
*   → optional speaker-preview EQ
*   → analyser + destination
*/
function createMixer(ctx) {
	const pad = ctx.createGain();
	const bass = ctx.createGain();
	const lead = ctx.createGain();
	const perc = ctx.createGain();
	pad.gain.value = 1;
	bass.gain.value = 1;
	lead.gain.value = 1;
	perc.gain.value = 1;
	const music = ctx.createGain();
	music.gain.value = 1;
	const sfx = ctx.createGain();
	sfx.gain.value = 1;
	pad.connect(music);
	bass.connect(music);
	lead.connect(music);
	perc.connect(music);
	const hipass = ctx.createBiquadFilter();
	hipass.type = "highpass";
	hipass.frequency.value = 72;
	hipass.Q.value = .65;
	const mud = ctx.createBiquadFilter();
	mud.type = "peaking";
	mud.frequency.value = 260;
	mud.gain.value = -2.4;
	mud.Q.value = .8;
	const presence = ctx.createBiquadFilter();
	presence.type = "peaking";
	presence.frequency.value = 2300;
	presence.gain.value = 1.8;
	presence.Q.value = .65;
	const air = ctx.createBiquadFilter();
	air.type = "highshelf";
	air.frequency.value = 7e3;
	air.gain.value = 1.2;
	const compressor = ctx.createDynamicsCompressor();
	compressor.threshold.value = -14;
	compressor.knee.value = 10;
	compressor.ratio.value = 1.8;
	compressor.attack.value = .024;
	compressor.release.value = .24;
	const makeup = ctx.createGain();
	makeup.gain.value = 1;
	const saturator = ctx.createWaveShaper();
	saturator.curve = tanhShaper(1.35);
	saturator.oversample = "2x";
	const satMix = ctx.createGain();
	satMix.gain.value = .1;
	const dry = ctx.createGain();
	dry.gain.value = .95;
	const limiter = ctx.createDynamicsCompressor();
	limiter.threshold.value = -1.2;
	limiter.knee.value = .15;
	limiter.ratio.value = 20;
	limiter.attack.value = .002;
	limiter.release.value = .09;
	const master = ctx.createGain();
	master.gain.value = 1;
	const speakerHp = ctx.createBiquadFilter();
	speakerHp.type = "highpass";
	speakerHp.frequency.value = 20;
	const speakerLp = ctx.createBiquadFilter();
	speakerLp.type = "lowpass";
	speakerLp.frequency.value = 18e3;
	const analyser = ctx.createAnalyser();
	analyser.fftSize = 256;
	analyser.smoothingTimeConstant = .8;
	const meter = ctx.createAnalyser();
	meter.fftSize = 2048;
	meter.smoothingTimeConstant = .25;
	const space = createSpace(ctx);
	music.connect(hipass);
	sfx.connect(hipass);
	space.output.connect(hipass);
	hipass.connect(mud);
	mud.connect(presence);
	presence.connect(air);
	air.connect(compressor);
	compressor.connect(makeup);
	makeup.connect(dry);
	makeup.connect(saturator);
	saturator.connect(satMix);
	dry.connect(limiter);
	satMix.connect(limiter);
	limiter.connect(master);
	master.connect(speakerHp);
	speakerHp.connect(speakerLp);
	speakerLp.connect(analyser);
	speakerLp.connect(meter);
	if ("destination" in ctx) analyser.connect(ctx.destination);
	let profile = mixProfileFor("menta");
	space.setProfile(profile.space);
	const applyEq = () => {
		const t = "currentTime" in ctx ? ctx.currentTime : 0;
		hipass.frequency.setTargetAtTime(profile.eq.hipass, t, .05);
		mud.gain.setTargetAtTime(profile.eq.mudGain, t, .05);
		if (!mixer.speakerPreview) {
			presence.gain.setTargetAtTime(profile.eq.presenceGain, t, .05);
			air.gain.setTargetAtTime(profile.eq.airGain, t, .05);
		}
	};
	const apply = () => {
		const t = "currentTime" in ctx ? ctx.currentTime : 0;
		const musicG = mixer.musicMuted ? 0 : mixer.musicVolume;
		const sfxG = mixer.sfxMuted ? 0 : mixer.sfxVolume;
		music.gain.setTargetAtTime(musicG, t, .03);
		sfx.gain.setTargetAtTime(sfxG, t, .03);
		master.gain.setTargetAtTime(mixer.masterVolume, t, .03);
		pad.gain.setTargetAtTime(profile.pad, t, .05);
		bass.gain.setTargetAtTime(profile.bass, t, .05);
		lead.gain.setTargetAtTime(profile.lead, t, .05);
		perc.gain.setTargetAtTime(profile.perc, t, .05);
		makeup.gain.setTargetAtTime(1 * profile.makeup, t, .05);
		applyEq();
	};
	const timeDomain = new Uint8Array(/* @__PURE__ */ new ArrayBuffer(2048));
	const mixer = {
		ctx,
		master,
		music,
		sfx,
		pad,
		bass,
		lead,
		perc,
		compressor,
		limiter,
		makeup,
		analyser,
		meter,
		space,
		musicVolume: 1,
		sfxVolume: 1,
		masterVolume: 1,
		musicMuted: false,
		sfxMuted: false,
		speakerPreview: false,
		setMusicVolume(value) {
			mixer.musicVolume = clamp(value);
			apply();
		},
		setSfxVolume(value) {
			mixer.sfxVolume = clamp(value);
			apply();
		},
		setMasterVolume(value) {
			mixer.masterVolume = clamp(value);
			apply();
		},
		setMusicMuted(muted) {
			mixer.musicMuted = muted;
			apply();
		},
		setSfxMuted(muted) {
			mixer.sfxMuted = muted;
			apply();
		},
		setThemeMix(theme, revision = "v1.2") {
			profile = mixProfileFor(theme, revision);
			space.setProfile(profile.space);
			apply();
		},
		setMixProfile(next) {
			profile = next;
			space.setProfile(profile.space);
			apply();
		},
		setSpeakerPreview(on) {
			mixer.speakerPreview = on;
			speakerHp.frequency.value = on ? 260 : 20;
			speakerLp.frequency.value = on ? 4500 : 18e3;
			presence.gain.value = on ? 3.2 : profile.eq.presenceGain;
			air.gain.value = on ? 2 : profile.eq.airGain;
		},
		prepareHarmonicChange(time, seconds = .28) {
			space.duck(time, seconds);
		},
		busFor(voice) {
			if (voice === "pad" || voice === "noise") return pad;
			if (voice === "bass") return bass;
			if (voice === "kick" || voice === "snare" || voice === "hat" || voice === "click") return perc;
			if (voice === "pickup" || voice === "event") return sfx;
			return lead;
		},
		sendAmount(voice) {
			return profile.sends[voice] ?? 0;
		},
		readMeter() {
			try {
				meter.getByteTimeDomainData(timeDomain);
			} catch {
				return {
					peak: 0,
					rms: 0,
					peakDbfs: -120,
					rmsDbfs: -120,
					reduction: 0,
					compressorReduction: 0
				};
			}
			let peak = 0;
			let sum = 0;
			for (let i = 0; i < timeDomain.length; i++) {
				const x = ((timeDomain[i] ?? 128) - 128) / 128;
				const a = Math.abs(x);
				if (a > peak) peak = a;
				sum += x * x;
			}
			const rms = Math.sqrt(sum / timeDomain.length);
			const toDbfs = (v) => v <= 1e-8 ? -120 : 20 * Math.log10(v);
			return {
				peak,
				rms,
				peakDbfs: toDbfs(peak),
				rmsDbfs: toDbfs(rms),
				reduction: limiter.reduction ?? 0,
				compressorReduction: compressor.reduction ?? 0
			};
		},
		dispose() {
			try {
				pad.disconnect();
				bass.disconnect();
				lead.disconnect();
				perc.disconnect();
				music.disconnect();
				sfx.disconnect();
				hipass.disconnect();
				mud.disconnect();
				presence.disconnect();
				air.disconnect();
				compressor.disconnect();
				makeup.disconnect();
				saturator.disconnect();
				satMix.disconnect();
				dry.disconnect();
				limiter.disconnect();
				master.disconnect();
				speakerHp.disconnect();
				speakerLp.disconnect();
				analyser.disconnect();
				meter.disconnect();
				space.dispose();
			} catch {}
		}
	};
	apply();
	return mixer;
}
function hashSeed(seed) {
	let h = 2166136261;
	for (let i = 0; i < seed.length; i++) {
		h ^= seed.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
function createPrng(seed) {
	let state = hashSeed(seed) || 2654435769;
	const next = () => {
		state |= 0;
		state = state + 1831565813 | 0;
		let t = Math.imul(state ^ state >>> 15, 1 | state);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
	const nextInt = (maxExclusive) => {
		if (maxExclusive <= 0) return 0;
		return Math.floor(next() * maxExclusive);
	};
	return {
		seed,
		next,
		nextInt,
		nextRange(min, max) {
			return min + next() * (max - min);
		},
		nextIntRange(min, maxInclusive) {
			if (maxInclusive < min) return min;
			return min + nextInt(maxInclusive - min + 1);
		},
		pick(items) {
			if (items.length === 0) throw new Error("Prng.pick called on empty list");
			return items[nextInt(items.length)];
		},
		weighted(items) {
			const total = items.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
			if (total <= 0 || items.length === 0) throw new Error("Prng.weighted called with no positive weights");
			let cursor = next() * total;
			for (const entry of items) {
				cursor -= Math.max(0, entry.weight);
				if (cursor <= 0) return entry.item;
			}
			return items[items.length - 1].item;
		},
		chance(probability) {
			return next() < probability;
		},
		fork(label) {
			return createPrng(`${seed}::${label}`);
		}
	};
}
var BIOMES = [
	"ocean",
	"desert",
	"tropical",
	"lava",
	"glacial",
	"crystal",
	"dead",
	"storm",
	"mixed"
];
var MOODS = [
	"calm",
	"hopeful",
	"mysterious",
	"tense",
	"dark",
	"energetic"
];
var SECTION_ORDER = [
	"INTRO",
	"A",
	"A_VARIATION",
	"B",
	"A",
	"BUILD",
	"PEAK",
	"RECOVERY"
];
var LAB_LAYERS = [
	"harmony",
	"bass",
	"melody",
	"counter",
	"arp",
	"percussion",
	"atmosphere",
	"gameplay"
];
var PC_NAMES = [
	"C",
	"C#",
	"D",
	"Eb",
	"E",
	"F",
	"F#",
	"G",
	"Ab",
	"A",
	"Bb",
	"B"
];
function midiToFreq(midi) {
	return 440 * 2 ** ((midi - 69) / 12);
}
function clampMidi(midi) {
	if (!Number.isFinite(midi)) return 60;
	return Math.max(24, Math.min(108, Math.round(midi)));
}
function pitchClass(midi) {
	return (Math.round(midi) % 12 + 12) % 12;
}
function pcName(pc) {
	return PC_NAMES[(pc % 12 + 12) % 12] ?? "C";
}
function nearestMidi(pc, around) {
	const targetPc = (pc % 12 + 12) % 12;
	const base = Math.round(around);
	let best = base;
	let bestDist = 99;
	for (let delta = -18; delta <= 18; delta++) {
		const candidate = base + delta;
		if (pitchClass(candidate) === targetPc) {
			const dist = Math.abs(candidate - around);
			if (dist < bestDist) {
				best = candidate;
				bestDist = dist;
			}
		}
	}
	return clampMidi(best);
}
function lerp(a, b, t) {
	return a + (b - a) * t;
}
function clamp01(value) {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(1, value));
}
var Transport = class {
	bpm;
	beatsPerBar = 4;
	subdivision = 4;
	running = false;
	paused = false;
	currentBeat = 0;
	currentBar = 0;
	startTime = 0;
	pauseOffset = 0;
	lastTick = -1;
	constructor(bpm = 80) {
		this.bpm = bpm;
	}
	secondsPerBeat() {
		return 60 / Math.max(30, this.bpm);
	}
	secondsPerTick() {
		return this.secondsPerBeat() / this.subdivision;
	}
	start(audioTime) {
		this.running = true;
		this.paused = false;
		this.startTime = audioTime - this.pauseOffset;
		this.lastTick = -1;
	}
	pause(audioTime) {
		if (!this.running || this.paused) return;
		this.paused = true;
		this.pauseOffset = audioTime - this.startTime;
	}
	resume(audioTime) {
		if (!this.paused) return;
		this.paused = false;
		this.startTime = audioTime - this.pauseOffset;
	}
	stop() {
		this.running = false;
		this.paused = false;
		this.pauseOffset = 0;
		this.currentBeat = 0;
		this.currentBar = 0;
		this.lastTick = -1;
		this.startTime = 0;
	}
	setBpm(bpm, audioTime) {
		const elapsed = this.elapsedBeats(audioTime);
		this.bpm = Math.max(48, Math.min(160, bpm));
		this.startTime = audioTime - elapsed * this.secondsPerBeat();
	}
	elapsedBeats(audioTime) {
		if (!this.running) return 0;
		const t = this.paused ? this.pauseOffset : audioTime - this.startTime;
		return Math.max(0, t / this.secondsPerBeat());
	}
	beatTime(audioTime) {
		const beats = this.elapsedBeats(audioTime);
		const bar = Math.floor(beats / this.beatsPerBar);
		const beatInBar = beats - bar * this.beatsPerBar;
		const tick = Math.floor(beatInBar * this.subdivision);
		this.currentBar = bar;
		this.currentBeat = beatInBar;
		return {
			bar,
			beat: beatInBar,
			tick,
			fractionalBeat: beatInBar
		};
	}
	timeOfTick(bar, tick) {
		const beats = bar * this.beatsPerBar + tick / this.subdivision;
		return this.startTime + beats * this.secondsPerBeat();
	}
	seekToBar(bar, audioTime) {
		const offset = Math.max(0, bar) * this.beatsPerBar * this.secondsPerBeat();
		if (this.paused) this.pauseOffset = offset;
		else this.startTime = audioTime - offset;
		this.currentBar = Math.max(0, bar);
		this.currentBeat = 0;
		this.lastTick = Math.max(0, bar) * 16 - 1;
	}
	consumeTicks(audioTime, lookaheadSec) {
		if (!this.running || this.paused) return [];
		const ahead = this.elapsedBeats(audioTime + lookaheadSec);
		const lastBeat = this.lastTick < 0 ? this.elapsedBeats(audioTime) : this.lastTick / this.subdivision;
		const startTick = Math.max(0, Math.floor(lastBeat * this.subdivision + 1e-6) + (this.lastTick < 0 ? 0 : 1));
		const endTick = Math.floor(ahead * this.subdivision);
		const events = [];
		for (let abs = startTick; abs <= endTick; abs++) {
			const bar = Math.floor(abs / 16);
			const tick = abs % 16;
			events.push({
				bar,
				tick,
				time: this.timeOfTick(bar, abs % 16 + bar * 0)
			});
			events[events.length - 1].time = this.startTime + abs / this.subdivision * this.secondsPerBeat();
			this.lastTick = abs;
		}
		return events;
	}
};
var VoiceManager = class {
	voices = [];
	maxVoices;
	scheduledEvents = 0;
	constructor(maxVoices = 28) {
		this.maxVoices = maxVoices;
	}
	get activeVoices() {
		return this.voices.length;
	}
	peekPriorities() {
		return this.voices.map((v) => v.priority);
	}
	track(nodes, stopAt, priority = 1) {
		this.voices.push({
			nodes,
			stopAt,
			priority
		});
		this.scheduledEvents += 1;
		while (this.voices.length > this.maxVoices) {
			let idx = 0;
			for (let i = 1; i < this.voices.length; i++) {
				const a = this.voices[i];
				const b = this.voices[idx];
				if (a.priority < b.priority || a.priority === b.priority && a.stopAt < b.stopAt) idx = i;
			}
			const victim = this.voices.splice(idx, 1)[0];
			if (victim) this.stopNow(victim);
		}
	}
	sweep(now) {
		const keep = [];
		for (const voice of this.voices) if (voice.stopAt <= now) this.disconnect(voice);
		else keep.push(voice);
		this.voices = keep;
	}
	dispose() {
		for (const voice of this.voices) this.stopNow(voice);
		this.voices = [];
		this.scheduledEvents = 0;
	}
	stopNow(voice) {
		for (const node of voice.nodes) try {
			if ("stop" in node && typeof node.stop === "function") node.stop();
		} catch {}
		this.disconnect(voice);
	}
	disconnect(voice) {
		for (const node of voice.nodes) try {
			node.disconnect();
		} catch {}
	}
};
/** Interval sets in semitones from tonic. General music theory only. */
var SCALE_INTERVALS = {
	major: [
		0,
		2,
		4,
		5,
		7,
		9,
		11
	],
	naturalMinor: [
		0,
		2,
		3,
		5,
		7,
		8,
		10
	],
	dorian: [
		0,
		2,
		3,
		5,
		7,
		9,
		10
	],
	phrygian: [
		0,
		1,
		3,
		5,
		7,
		8,
		10
	],
	lydian: [
		0,
		2,
		4,
		6,
		7,
		9,
		11
	],
	mixolydian: [
		0,
		2,
		4,
		5,
		7,
		9,
		10
	],
	aeolian: [
		0,
		2,
		3,
		5,
		7,
		8,
		10
	],
	majorPentatonic: [
		0,
		2,
		4,
		7,
		9
	],
	minorPentatonic: [
		0,
		3,
		5,
		7,
		10
	],
	lydianPentatonic: [
		0,
		2,
		4,
		6,
		9
	],
	harmonicMinor: [
		0,
		2,
		3,
		5,
		7,
		8,
		11
	],
	melodicMinor: [
		0,
		2,
		3,
		5,
		7,
		9,
		11
	]
};
function scalePitchClasses(tonicPc, scale) {
	return SCALE_INTERVALS[scale].map((interval) => (tonicPc + interval) % 12);
}
function isInScale(midi, tonicPc, scale) {
	const pc = (Math.round(midi) % 12 + 12) % 12;
	return scalePitchClasses(tonicPc, scale).includes(pc);
}
function nearestScaleMidi(midi, tonicPc, scale) {
	const pcs = scalePitchClasses(tonicPc, scale);
	const target = Math.round(midi);
	let best = target;
	let bestDist = 99;
	for (let delta = -12; delta <= 12; delta++) {
		const candidate = target + delta;
		if (pcs.includes((candidate % 12 + 12) % 12)) {
			const dist = Math.abs(delta);
			if (dist < bestDist) {
				best = candidate;
				bestDist = dist;
			}
		}
	}
	return best;
}
function diatonicRootPc(tonicPc, scale, degree, alteration = 0) {
	const intervals = SCALE_INTERVALS[scale];
	return (tonicPc + ((intervals.length >= 7 ? intervals : SCALE_INTERVALS.major)[degree - 1] ?? 0) + alteration + 120) % 12;
}
/** Chord interval recipes in semitones from chord root. */
var QUALITY_INTERVALS = {
	maj: [
		0,
		4,
		7
	],
	min: [
		0,
		3,
		7
	],
	sus2: [
		0,
		2,
		7
	],
	sus4: [
		0,
		5,
		7
	],
	maj7: [
		0,
		4,
		7,
		11
	],
	min7: [
		0,
		3,
		7,
		10
	],
	add9: [
		0,
		4,
		7,
		14
	],
	minadd9: [
		0,
		3,
		7,
		14
	],
	maj6: [
		0,
		4,
		7,
		9
	],
	min6: [
		0,
		3,
		7,
		9
	],
	dom7: [
		0,
		4,
		7,
		10
	],
	maj9: [
		0,
		4,
		7,
		11,
		14
	],
	min9: [
		0,
		3,
		7,
		10,
		14
	],
	dim: [
		0,
		3,
		6
	],
	halfdim: [
		0,
		3,
		6,
		10
	],
	aug: [
		0,
		4,
		8
	],
	sus2add6: [
		0,
		2,
		7,
		9
	]
};
function chordKey(symbol) {
	return `${symbol.alteration === -1 ? "b" : symbol.alteration === 1 ? "#" : ""}${roman(symbol.degree)}:${symbol.quality}`;
}
function roman(degree) {
	return [
		"I",
		"II",
		"III",
		"IV",
		"V",
		"VI",
		"VII"
	][degree - 1] ?? "I";
}
function chordPitchClasses(tonicPc, scale, symbol) {
	const root = diatonicRootPc(tonicPc, scale, symbol.degree, symbol.alteration);
	const intervals = QUALITY_INTERVALS[symbol.quality] ?? QUALITY_INTERVALS.maj;
	const unique = [];
	for (const interval of intervals) {
		const pc = (root + interval) % 12;
		if (!unique.includes(pc)) unique.push(pc);
	}
	return unique;
}
function voiceChord(options) {
	const { tonicPc, scale, symbol, previous, lowMidi, highMidi } = options;
	const pcs = chordPitchClasses(tonicPc, scale, symbol);
	const rootPc = pcs[0] ?? tonicPc;
	const bassMidi = nearestMidi(rootPc, (options.bassOctave ?? 2) * 12 + 12 + rootPc);
	const bassSafe = Math.max(36, bassMidi);
	const voiced = [];
	if (previous && previous.length > 0) {
		const remainingPcs = [...pcs];
		const remainingPrev = [...previous];
		const assigned = [];
		for (const prev of previous) {
			const pc = pitchClass(prev);
			const idx = remainingPcs.indexOf(pc);
			if (idx >= 0) {
				assigned.push(clampMidi(Math.max(lowMidi, Math.min(highMidi, prev))));
				remainingPcs.splice(idx, 1);
				const pidx = remainingPrev.indexOf(prev);
				if (pidx >= 0) remainingPrev.splice(pidx, 1);
			}
		}
		for (const pc of remainingPcs) {
			const anchors = remainingPrev.length > 0 ? remainingPrev : assigned.length > 0 ? assigned : [(lowMidi + highMidi) / 2];
			let bestMidi = nearestMidi(pc, anchors[0]);
			let bestDist = 99;
			let bestIdx = 0;
			for (let i = 0; i < anchors.length; i++) {
				const candidate = nearestMidi(pc, anchors[i]);
				const dist = Math.abs(candidate - anchors[i]);
				if (dist < bestDist) {
					bestMidi = candidate;
					bestDist = dist;
					bestIdx = i;
				}
			}
			if (bestDist > 7) {
				const down = bestMidi - 12;
				const up = bestMidi + 12;
				const anchor = anchors[bestIdx];
				if (down >= lowMidi && Math.abs(down - anchor) < bestDist) bestMidi = down;
				else if (up <= highMidi && Math.abs(up - anchor) < bestDist) bestMidi = up;
			}
			assigned.push(clampMidi(Math.max(lowMidi, Math.min(highMidi, bestMidi))));
			if (remainingPrev.length > 0) remainingPrev.splice(Math.min(bestIdx, remainingPrev.length - 1), 1);
		}
		voiced.push(...assigned);
	} else {
		let cursor = lowMidi + 4;
		for (const pc of pcs) {
			const note = nearestMidi(pc, cursor);
			voiced.push(clampMidi(Math.max(lowMidi, Math.min(highMidi, note))));
			cursor = note + 5;
		}
	}
	voiced.sort((a, b) => a - b);
	const spaced = spaceLowVoicing(voiced);
	while (spaced.length > 0 && spaced[0] < lowMidi) {
		const shifted = spaced.shift() + 12;
		if (shifted <= highMidi) spaced.push(shifted);
		spaced.sort((a, b) => a - b);
	}
	return {
		symbol,
		pitchClasses: pcs,
		midi: uniqueSorted(spaced).slice(0, 5),
		rootMidi: nearestMidi(rootPc, 60),
		bassMidi: clampMidi(bassSafe)
	};
}
function chordTonesMidi(voicing, register) {
	const [low, high] = register;
	const out = [];
	for (const pc of voicing.pitchClasses) for (let oct = 2; oct <= 7; oct++) {
		const midi = oct * 12 + pc;
		if (midi >= low && midi <= high) out.push(midi);
	}
	return uniqueSorted(out);
}
function isChordTone(midi, voicing) {
	return voicing.pitchClasses.includes(pitchClass(midi));
}
function formatChord(tonicPc, scale, symbol) {
	return `${[
		"C",
		"C#",
		"D",
		"Eb",
		"E",
		"F",
		"F#",
		"G",
		"Ab",
		"A",
		"Bb",
		"B"
	][diatonicRootPc(tonicPc, scale, symbol.degree, symbol.alteration)]}${{
		maj: "",
		min: "m",
		sus2: "sus2",
		sus4: "sus4",
		maj7: "maj7",
		min7: "m7",
		add9: "add9",
		minadd9: "m(add9)",
		maj6: "6",
		min6: "m6",
		dom7: "7",
		maj9: "maj9",
		min9: "m9",
		dim: "dim",
		halfdim: "m7b5",
		aug: "aug",
		sus2add6: "sus2add6"
	}[symbol.quality]}`;
}
function uniqueSorted(values) {
	return [...new Set(values)].sort((a, b) => a - b);
}
/** Avoid stacked close thirds below the midrange. */
function spaceLowVoicing(midi) {
	const out = [...midi].sort((a, b) => a - b);
	for (let i = 1; i < out.length; i++) {
		const low = out[i - 1];
		const hi = out[i];
		if (hi < 58 && hi - low < 5) {
			const raised = hi + 12;
			if (raised <= 86) out[i] = raised;
		}
	}
	return out;
}
var PITCHED = [
	"lead",
	"pluck",
	"bell",
	"arp",
	"bass",
	"pickup"
];
var EXTENSION_PCS = {
	add9: [2],
	minadd9: [2],
	maj9: [2],
	min9: [2],
	sus2: [2],
	sus4: [5],
	maj6: [9],
	min6: [9],
	sus2add6: [2, 9],
	maj7: [11],
	min7: [10],
	dom7: [10]
};
function tensionPolicyFor(themeId, scale, opts) {
	if (opts?.anomaly) return "open";
	if (themeId === "eclipse" || scale === "phrygian" || scale === "harmonicMinor") return "open";
	if (themeId === "lavanda" || scale === "melodicMinor" || scale === "dorian" || (opts?.tension ?? 0) > .55) return "color";
	return "strict";
}
function intervalClass(a, b) {
	const d = Math.abs(pitchClass(a) - pitchClass(b));
	return Math.min(d, 12 - d);
}
function isStrongTick(tick) {
	const t = (tick % 16 + 16) % 16;
	return t === 0 || t === 8;
}
function isBeatTick(tick) {
	return (tick % 16 + 16) % 16 % 4 === 0;
}
function isHarshAgainstChord(midi, chord) {
	return chord.pitchClasses.some((pc) => intervalClass(midi, pc) === 1);
}
function nearestChordTone(midi, chord) {
	if (isChordTone(midi, chord)) return midi;
	let best = midi;
	let bestDist = 99;
	for (const pc of chord.pitchClasses) {
		const candidate = nearestMidi(pc, midi);
		const dist = Math.abs(candidate - midi);
		if (dist < bestDist) {
			best = candidate;
			bestDist = dist;
		}
	}
	return clampMidi(best);
}
function classifyNote(midi, chord, tonicPc, scale, ctx) {
	if (isChordTone(midi, chord)) return "chord-tone";
	const pc = pitchClass(midi);
	const rel = (pc - (chord.pitchClasses[0] ?? tonicPc) + 12) % 12;
	const extra = EXTENSION_PCS[chord.symbol.quality] ?? [];
	if (extra.includes(rel) || extra.includes(pc)) return "controlled-extension";
	const next = ctx?.next;
	const prev = ctx?.prev;
	if (next !== void 0 && isChordTone(next, chord) && intervalClass(midi, next) <= 2) return "approach-tone";
	if (prev !== void 0 && next !== void 0 && isChordTone(prev, chord) && isChordTone(next, chord) && ((midi - prev) * (next - midi) > 0 || intervalClass(midi, prev) <= 2)) return "passing-tone";
	if (isInScale(midi, tonicPc, scale)) return "tension";
	return "tension";
}
function consonantPickupInterval(a, b, policy) {
	const ic = intervalClass(a, b);
	if (ic === 0 || ic === 3 || ic === 4 || ic === 5 || ic === 7) return true;
	if (ic === 8 || ic === 9) return policy !== "strict";
	if (ic === 2) return policy !== "strict";
	if (ic === 1 || ic === 6 || ic === 11) return policy === "open";
	return false;
}
function chooseResolvedPickup(midi, chord, tonicPc, scale, policy) {
	let fitted = midi;
	if (policy === "strict" && isHarshAgainstChord(fitted, chord)) fitted = nearestChordTone(fitted, chord);
	else if (!isChordTone(fitted, chord) && !isInScale(fitted, tonicPc, scale)) fitted = nearestChordTone(fitted, chord);
	return clampMidi(fitted);
}
/**
* Snap a realized motif so strong beats and phrase endings belong to the chord,
* while passing / approach / world-color tension stay on weak ticks.
*/
function polishPhrase(notes, chord, tonicPc, scale, policy, voices = PITCHED) {
	const pitched = notes.map((note, index) => ({
		note,
		index
	})).filter(({ note }) => voices.includes(note.voice)).sort((a, b) => a.note.tick - b.note.tick || a.index - b.index);
	if (pitched.length === 0) return notes;
	const out = notes.map((n) => ({ ...n }));
	for (let i = 0; i < pitched.length; i++) {
		const note = out[pitched[i].index];
		const prev = i > 0 ? out[pitched[i - 1].index].midi : void 0;
		const next = i < pitched.length - 1 ? out[pitched[i + 1].index].midi : void 0;
		const last = i === pitched.length - 1;
		const strong = isStrongTick(note.tick) || last;
		const bassBeat = note.voice === "bass" && isBeatTick(note.tick);
		let midi = note.midi;
		const role = classifyNote(midi, chord, tonicPc, scale, {
			prev,
			next
		});
		const harsh = isHarshAgainstChord(midi, chord);
		const verticalMinorSecond = chord.midi.some((pad) => Math.abs(pad - midi) === 1);
		if (bassBeat) midi = nearestChordTone(midi, chord);
		else if (strong) {
			if (role === "chord-tone" || role === "controlled-extension") {
				if (policy === "strict" && (harsh || verticalMinorSecond)) midi = nearestChordTone(midi, chord);
			} else if (policy === "open" && role === "tension" && !last && note.tick % 16 !== 0) {} else if (policy === "color" && role === "tension" && !last && note.tick % 16 !== 0) {} else midi = nearestChordTone(midi, chord);
		} else if (policy === "strict" && (harsh || verticalMinorSecond)) midi = nearestChordTone(midi, chord);
		else if (!isInScale(midi, tonicPc, scale) && !isChordTone(midi, chord)) {
			midi = nearestScaleMidi(midi, tonicPc, scale);
			if (policy === "strict" && isHarshAgainstChord(midi, chord)) midi = nearestChordTone(midi, chord);
		}
		if (prev !== void 0 && Math.abs(midi - prev) > 9 && note.voice !== "bass") {
			const recovered = midi > prev ? midi - 12 : midi + 12;
			if (recovered >= 48 && recovered <= 96) midi = recovered;
		}
		note.midi = clampMidi(midi);
	}
	for (let i = 0; i < pitched.length - 1; i++) {
		const cur = out[pitched[i].index];
		const nxt = out[pitched[i + 1].index];
		if (cur.voice === "bass" || nxt.voice === "bass") continue;
		const curChord = isChordTone(cur.midi, chord) || classifyNote(cur.midi, chord, tonicPc, scale) === "controlled-extension";
		const nxtChord = isChordTone(nxt.midi, chord) || classifyNote(nxt.midi, chord, tonicPc, scale) === "controlled-extension";
		if (!curChord && !nxtChord && policy === "strict") nxt.midi = nearestChordTone(nxt.midi, chord);
	}
	const ending = out[pitched[pitched.length - 1].index];
	if (ending.voice !== "bass" || isBeatTick(ending.tick)) {
		const endRole = classifyNote(ending.midi, chord, tonicPc, scale);
		if (endRole !== "chord-tone" && endRole !== "controlled-extension" && policy !== "open") ending.midi = nearestChordTone(ending.midi, chord);
		else if (policy === "open" && isHarshAgainstChord(ending.midi, chord) && isStrongTick(ending.tick)) ending.midi = nearestChordTone(ending.midi, chord);
	}
	return out;
}
/** Nudge a scale-degree contour so realized strong positions are not accidental clashes. */
function adaptContourToChord(contour, chord, tonicPc, scale) {
	const intervals = SCALE_INTERVALS[scale];
	const out = [...contour];
	if (out.length === 0) return out;
	out[0] = snapDegreeToChord(out[0], chord, tonicPc, intervals);
	out[out.length - 1] = snapDegreeToChord(out[out.length - 1], chord, tonicPc, intervals);
	return out;
}
function snapDegreeToChord(degree, chord, tonicPc, intervals) {
	const wrapped = (degree % intervals.length + intervals.length) % intervals.length;
	const oct = Math.floor(degree / intervals.length);
	const pc = (tonicPc + (intervals[wrapped] ?? 0)) % 12;
	if (chord.pitchClasses.includes(pc)) return degree;
	let best = degree;
	let bestDist = 99;
	for (const delta of [
		-1,
		1,
		-2,
		2
	]) {
		const next = degree + delta;
		const npc = (tonicPc + (intervals[(next % intervals.length + intervals.length) % intervals.length] ?? 0)) % 12;
		if (chord.pitchClasses.includes(npc) && Math.abs(delta) < bestDist) {
			best = next + oct * 0;
			bestDist = Math.abs(delta);
		}
	}
	return best;
}
function commonToneMidis(a, b, register) {
	const shared = a.pitchClasses.filter((pc) => b.pitchClasses.includes(pc));
	const out = [];
	for (const pc of shared.length ? shared : a.pitchClasses.slice(0, 2)) {
		const fromA = a.midi.find((m) => pitchClass(m) === pc);
		out.push(clampMidi(fromA ?? nearestMidi(pc, (register[0] + register[1]) / 2)));
	}
	return out.slice(0, 3);
}
function validatePickup(midi, chord, tonicPc, scale) {
	if (!Number.isFinite(midi)) return false;
	if (midi < 24 || midi > 108) return false;
	const pc = (Math.round(midi) % 12 + 12) % 12;
	return chord.pitchClasses.includes(pc) || isInScale(midi, tonicPc, scale);
}
function varyMotif(motif, kind, rng) {
	const contour = [...motif.contour];
	const rhythm = [...motif.rhythm];
	const rests = [...motif.rests];
	const accents = [...motif.accents];
	switch (kind) {
		case "transpose": {
			const shift = rng.pick([
				-2,
				-1,
				1,
				2
			]);
			return copy(motif, "t", contour.map((d) => d + shift), rhythm, rests, accents);
		}
		case "invert": {
			const pivot = contour[0] ?? 0;
			return copy(motif, "i", contour.map((d) => pivot - (d - pivot)), rhythm, rests, accents);
		}
		case "ending":
			if (contour.length >= 2) {
				contour[contour.length - 1] = 0;
				contour[contour.length - 2] = rng.pick([
					1,
					2,
					4
				]);
			}
			return copy(motif, "e", contour, rhythm, rests, accents);
		case "displace": return copy(motif, "d", contour, [1, ...rhythm], [true, ...rests], [false, ...accents]);
		case "octave": {
			const dir = rng.chance(.5) ? 7 : -7;
			return copy(motif, "o", contour.map((d, i) => i % 2 === 0 ? d + dir : d), rhythm, rests, accents);
		}
		case "fragment": {
			const cut = Math.max(2, Math.ceil(contour.length / 2));
			return copy(motif, "f", contour.slice(0, cut), rhythm.slice(0, cut), rests.slice(0, cut), accents.slice(0, cut));
		}
		case "extend": {
			const extra = rng.pick([
				0,
				2,
				4,
				3
			]);
			return copy(motif, "x", [...contour, extra], [...rhythm, rng.pick([2, 4])], [...rests, false], [...accents, true]);
		}
		case "response": return copy(motif, "r", contour.slice().reverse().map((d) => d + rng.pick([
			-1,
			0,
			1
		])), rhythm, rests, accents);
		default: return motif;
	}
}
/** Deterministic development — no independent coin-flips. Used by the v1.3 composer. */
function varyMotifComposed(motif, kind) {
	const contour = [...motif.contour];
	const rhythm = [...motif.rhythm];
	const rests = [...motif.rests];
	const accents = [...motif.accents];
	switch (kind) {
		case "transpose": return copy(motif, "t", contour.map((d) => d + 2), rhythm, rests, accents);
		case "invert": {
			const pivot = contour[0] ?? 0;
			return copy(motif, "i", contour.map((d) => pivot - (d - pivot)), rhythm, rests, accents);
		}
		case "ending":
			if (contour.length >= 2) {
				contour[contour.length - 1] = 0;
				contour[contour.length - 2] = 2;
			}
			return copy(motif, "e", contour, rhythm, rests, accents);
		case "displace": return copy(motif, "d", contour, [1, ...rhythm], [true, ...rests], [false, ...accents]);
		case "octave": return copy(motif, "o", contour.map((d, i) => i % 2 === 0 ? d + 7 : d), rhythm, rests, accents);
		case "fragment": {
			const cut = Math.max(2, Math.ceil(contour.length / 2));
			return copy(motif, "f", contour.slice(0, cut), rhythm.slice(0, cut), rests.slice(0, cut), accents.slice(0, cut));
		}
		case "extend": return copy(motif, "x", [...contour, 0], [...rhythm, 4], [...rests, false], [...accents, true]);
		case "response": return copy(motif, "r", contour.slice().reverse(), rhythm, rests, accents);
		default: return motif;
	}
}
function variationForStage(stage, localBar) {
	if (stage === "prime" || stage === "repeat") return "prime";
	if (stage === "develop") {
		if (localBar <= 1) return "prime";
		if (localBar <= 3) return "transpose";
		if (localBar <= 5) return "fragment";
		return "ending";
	}
	if (localBar <= 1) return "prime";
	if (localBar <= 3) return "invert";
	if (localBar <= 5) return "response";
	return "ending";
}
function copy(motif, suffix, contour, rhythm, rests, accents) {
	return {
		id: `${motif.id}-${suffix}`,
		contour,
		rhythm,
		rests,
		accents
	};
}
function realizeMotif(options) {
	const { motif, tonicPc, scale, chord, register, startTick = 0, voice = "lead", velocity = .7, policy = "strict", polish = true } = options;
	const contour = polish ? adaptContourToChord(motif.contour, chord, tonicPc, scale) : motif.contour;
	const notes = [];
	let tick = startTick;
	const intervals = SCALE_INTERVALS[scale];
	const [low, high] = register;
	let lastMidi = clampMidi((low + high) / 2);
	for (let i = 0; i < contour.length; i++) {
		const dur = Math.max(1, motif.rhythm[i] ?? 2);
		const rest = motif.rests[i] ?? false;
		const accent = motif.accents[i] ?? false;
		if (!rest) {
			const degree = contour[i] ?? 0;
			const wrapped = (degree % intervals.length + intervals.length) % intervals.length;
			const oct = Math.floor(degree / intervals.length);
			const interval = intervals[wrapped] ?? 0;
			let midi = 12 * (4 + oct) + (tonicPc + interval) % 12;
			midi = nearestMidi(midi % 12, lastMidi);
			if (midi < low) midi += 12;
			if (midi > high) midi -= 12;
			midi = clampMidi(Math.max(low, Math.min(high, midi)));
			if (tick % 8 === 0 || tick % 8 === 4 || accent) midi = nearestChordTone(midi, chord);
			else if (!isInScale(midi, tonicPc, scale)) midi = nearestScaleMidi(midi, tonicPc, scale);
			if (Math.abs(midi - lastMidi) > 9) {
				const recovered = midi > lastMidi ? midi - 12 : midi + 12;
				if (recovered >= low && recovered <= high) midi = recovered;
			}
			notes.push({
				tick,
				durationTicks: dur,
				midi: clampMidi(midi),
				velocity: clampVel(velocity * (accent ? 1 : .78)),
				voice
			});
			lastMidi = midi;
		}
		tick += dur;
	}
	return polish ? polishPhrase(notes, chord, tonicPc, scale, policy, [voice]) : notes;
}
function clampVel(value) {
	if (!Number.isFinite(value)) return .6;
	return Math.max(.05, Math.min(1, value));
}
function pickVariation(barIndex, rng) {
	if (barIndex % 16 === 14) return "ending";
	if (barIndex % 8 === 4) return rng.pick([
		"transpose",
		"response",
		"fragment"
	]);
	if (barIndex % 8 === 6) return rng.pick([
		"invert",
		"displace",
		"octave"
	]);
	if (barIndex % 4 === 2) return rng.pick([
		"prime",
		"extend",
		"transpose"
	]);
	return "prime";
}
function flattenProgression(chords, totalBars) {
	const perBar = [];
	for (const chord of chords) {
		const span = Math.max(1, chord.bars);
		for (let i = 0; i < span; i++) perBar.push({
			...chord,
			bars: 1
		});
	}
	if (perBar.length === 0) return Array.from({ length: totalBars }, () => ({
		degree: 1,
		alteration: 0,
		quality: "add9",
		bars: 1
	}));
	while (perBar.length < totalBars) perBar.push(perBar[perBar.length % chords.length] ?? perBar[0]);
	return perBar.slice(0, totalBars);
}
function motif(id, contour, rhythm, accents = [], rests = []) {
	return {
		id,
		contour,
		rhythm,
		accents: contour.map((_, i) => (accents[i] ?? 0) > 0),
		rests: contour.map((_, i) => (rests[i] ?? 0) > 0)
	};
}
function perc(parts) {
	const toStep = (value) => value >= 3 ? 3 : value >= 2 ? 2 : value >= 1 ? 1 : 0;
	return {
		kick: parts.kick.map(toStep),
		snare: parts.snare.map(toStep),
		hat: parts.hat.map(toStep),
		click: (parts.click ?? Array(16).fill(0)).map(toStep)
	};
}
function bass(steps) {
	return { steps };
}
function chord(degree, quality, alteration = 0, bars = 1) {
	return {
		degree,
		quality,
		alteration,
		bars
	};
}
function edge(to, weight) {
	return {
		to,
		weight
	};
}
var DURAZNO = {
	id: "durazno",
	name: "Durazno",
	identity: "Warmer, energetic, playful movement with rhythmic confidence.",
	tempoRange: [94, 104],
	scales: [
		"mixolydian",
		"major",
		"majorPentatonic"
	],
	tonicPcs: [
		0,
		5,
		7,
		10,
		2
	],
	chordVocab: [
		chord(1, "maj6"),
		chord(4, "add9"),
		chord(5, "sus4"),
		chord(2, "min7"),
		chord(7, "min7", -1),
		chord(1, "add9"),
		chord(4, "maj6"),
		chord(3, "min7")
	],
	progressionGraph: {
		"I:maj6": [
			edge("IV:add9", .32),
			edge("II:min7", .24),
			edge("bVII:min7", .22),
			edge("I:add9", .22)
		],
		"I:add9": [
			edge("IV:maj6", .34),
			edge("V:sus4", .28),
			edge("III:min7", .2),
			edge("II:min7", .18)
		],
		"IV:add9": [
			edge("I:maj6", .3),
			edge("V:sus4", .28),
			edge("II:min7", .22),
			edge("bVII:min7", .2)
		],
		"IV:maj6": [
			edge("I:add9", .4),
			edge("II:min7", .3),
			edge("V:sus4", .3)
		],
		"V:sus4": [
			edge("I:maj6", .4),
			edge("IV:add9", .3),
			edge("III:min7", .3)
		],
		"II:min7": [
			edge("V:sus4", .36),
			edge("IV:add9", .32),
			edge("I:maj6", .32)
		],
		"III:min7": [
			edge("IV:add9", .45),
			edge("II:min7", .3),
			edge("I:add9", .25)
		],
		"bVII:min7": [edge("IV:add9", .5), edge("I:maj6", .5)]
	},
	preferredProgressionLengths: [8, 4],
	motifs: [
		motif("durazno-skip", [
			0,
			2,
			0,
			4,
			7,
			4
		], [
			1,
			1,
			2,
			2,
			2,
			4
		], [
			1,
			0,
			0,
			1,
			0,
			1
		]),
		motif("durazno-cell", [
			2,
			4,
			5,
			4,
			2
		], [
			2,
			1,
			1,
			2,
			4
		], [
			0,
			1,
			0,
			0,
			1
		]),
		motif("durazno-bounce", [
			0,
			4,
			2,
			5,
			4,
			7
		], [
			1,
			1,
			2,
			2,
			2,
			4
		], [
			1,
			0,
			0,
			1,
			0,
			1
		])
	],
	bassPatterns: [bass([
		1,
		0,
		0,
		0,
		1,
		0,
		3,
		0,
		2,
		0,
		0,
		0,
		1,
		0,
		5,
		0
	]), bass([
		1,
		0,
		0,
		1,
		0,
		0,
		1,
		0,
		0,
		0,
		2,
		0,
		3,
		0,
		1,
		0
	])],
	percPatterns: [perc({
		kick: [
			2,
			0,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			1,
			2,
			0,
			0,
			1
		],
		snare: [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			2,
			0,
			0,
			0,
			0,
			1,
			0,
			0
		],
		hat: [
			1,
			0,
			2,
			0,
			1,
			0,
			2,
			1,
			1,
			0,
			2,
			0,
			1,
			0,
			2,
			0
		],
		click: [
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			1,
			0
		]
	})],
	arpTicks: [
		0,
		2,
		4,
		6,
		8,
		10,
		12,
		14
	],
	densityRange: [.5, .88],
	variationProbability: .36,
	cadenceEveryBars: 8,
	timbre: {
		padCutoff: 2100,
		padDetune: 10,
		pluckCutoff: 3200,
		bassCutoff: 980,
		leadCutoff: 2900,
		bellInharmonic: .1,
		noiseAmount: .08,
		brightness: .76,
		space: .34
	},
	sectionWeights: {
		INTRO: .6,
		A: 1.2,
		A_VARIATION: 1.2,
		B: 1.1,
		BUILD: 1,
		PEAK: 1,
		RECOVERY: .6
	},
	melodyRegister: [64, 81],
	bassRegister: [36, 50],
	padRegister: [48, 72],
	restBias: .1,
	swing: .08
};
var ECLIPSE = {
	id: "eclipse",
	name: "Eclipse",
	identity: "Dangerous, deep, powerful, cosmic, final, unstable.",
	tempoRange: [100, 112],
	scales: [
		"phrygian",
		"harmonicMinor",
		"naturalMinor"
	],
	tonicPcs: [
		4,
		9,
		2,
		7,
		0
	],
	chordVocab: [
		chord(1, "min"),
		chord(2, "maj", -1),
		chord(4, "min7"),
		chord(6, "min"),
		chord(5, "dom7"),
		chord(7, "maj", -1),
		chord(1, "minadd9"),
		chord(2, "sus4", -1)
	],
	progressionGraph: {
		"I:min": [
			edge("bII:maj", .3),
			edge("IV:min7", .24),
			edge("VI:min", .24),
			edge("I:minadd9", .22)
		],
		"I:minadd9": [
			edge("bII:maj", .34),
			edge("bII:sus4", .22),
			edge("IV:min7", .22),
			edge("V:dom7", .22)
		],
		"bII:maj": [
			edge("I:min", .4),
			edge("bVII:maj", .3),
			edge("IV:min7", .3)
		],
		"bII:sus4": [edge("I:min", .5), edge("bII:maj", .5)],
		"IV:min7": [
			edge("bII:maj", .32),
			edge("I:min", .32),
			edge("V:dom7", .36)
		],
		"VI:min": [
			edge("bII:maj", .4),
			edge("IV:min7", .3),
			edge("I:min", .3)
		],
		"V:dom7": [edge("I:min", .5), edge("bII:maj", .5)],
		"bVII:maj": [
			edge("bII:maj", .4),
			edge("I:min", .35),
			edge("IV:min7", .25)
		]
	},
	preferredProgressionLengths: [8, 4],
	motifs: [
		motif("eclipse-drive", [
			0,
			1,
			0,
			3,
			1,
			0
		], [
			2,
			2,
			2,
			2,
			4,
			4
		], [
			1,
			0,
			1,
			0,
			1,
			1
		]),
		motif("eclipse-tension", [
			0,
			1,
			3,
			4,
			0
		], [
			2,
			2,
			2,
			4,
			6
		], [
			1,
			0,
			0,
			1,
			1
		]),
		motif("eclipse-power", [
			0,
			4,
			3,
			1,
			0,
			3
		], [
			2,
			2,
			4,
			2,
			2,
			4
		], [
			1,
			1,
			0,
			0,
			1,
			0
		])
	],
	bassPatterns: [bass([
		1,
		0,
		1,
		0,
		0,
		0,
		1,
		0,
		2,
		0,
		0,
		0,
		3,
		0,
		1,
		0
	]), bass([
		1,
		0,
		0,
		1,
		1,
		0,
		0,
		0,
		1,
		0,
		2,
		0,
		1,
		0,
		3,
		0
	])],
	percPatterns: [perc({
		kick: [
			2,
			0,
			1,
			0,
			0,
			0,
			2,
			0,
			2,
			0,
			0,
			1,
			0,
			0,
			1,
			0
		],
		snare: [
			0,
			0,
			0,
			0,
			2,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			2,
			0,
			0,
			0
		],
		hat: [
			1,
			1,
			2,
			1,
			1,
			0,
			2,
			1,
			1,
			1,
			2,
			1,
			1,
			0,
			2,
			3
		],
		click: [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			2
		]
	})],
	arpTicks: [
		0,
		2,
		4,
		8,
		10,
		12
	],
	densityRange: [.52, .95],
	variationProbability: .34,
	cadenceEveryBars: 8,
	timbre: {
		padCutoff: 1550,
		padDetune: 8,
		pluckCutoff: 2100,
		bassCutoff: 820,
		leadCutoff: 2e3,
		bellInharmonic: .22,
		noiseAmount: .14,
		brightness: .42,
		space: .42
	},
	sectionWeights: {
		INTRO: .5,
		A: 1,
		A_VARIATION: 1,
		B: 1.1,
		BUILD: 1.3,
		PEAK: 1.4,
		RECOVERY: .5
	},
	melodyRegister: [60, 79],
	bassRegister: [36, 48],
	padRegister: [43, 67],
	restBias: .08,
	swing: .05
};
var GLACIAR = {
	id: "glaciar",
	name: "Glaciar",
	identity: "Cold, crystalline, isolated, spacious, elegant.",
	tempoRange: [66, 76],
	scales: [
		"aeolian",
		"dorian",
		"minorPentatonic"
	],
	tonicPcs: [
		4,
		9,
		11,
		2,
		0
	],
	chordVocab: [
		chord(1, "minadd9"),
		chord(4, "min7"),
		chord(6, "maj7"),
		chord(2, "sus2"),
		chord(5, "sus4"),
		chord(1, "min7"),
		chord(3, "maj7")
	],
	progressionGraph: {
		"I:minadd9": [
			edge("IV:min7", .3),
			edge("VI:maj7", .28),
			edge("II:sus2", .22),
			edge("I:min7", .2)
		],
		"I:min7": [
			edge("VI:maj7", .4),
			edge("IV:min7", .35),
			edge("I:minadd9", .25)
		],
		"IV:min7": [
			edge("I:minadd9", .36),
			edge("VI:maj7", .32),
			edge("V:sus4", .32)
		],
		"VI:maj7": [
			edge("I:minadd9", .4),
			edge("III:maj7", .3),
			edge("II:sus2", .3)
		],
		"II:sus2": [
			edge("V:sus4", .4),
			edge("I:minadd9", .35),
			edge("IV:min7", .25)
		],
		"V:sus4": [edge("I:minadd9", .55), edge("VI:maj7", .45)],
		"III:maj7": [edge("IV:min7", .5), edge("I:minadd9", .5)]
	},
	preferredProgressionLengths: [8, 8],
	motifs: [
		motif("glaciar-sparse", [
			0,
			7,
			4,
			0
		], [
			6,
			4,
			4,
			2
		], [
			1,
			0,
			0,
			1
		]),
		motif("glaciar-crystal", [
			7,
			4,
			7,
			4
		], [
			4,
			4,
			4,
			4
		], [
			1,
			0,
			1,
			0
		]),
		motif("glaciar-high", [
			4,
			6,
			4,
			0
		], [
			4,
			2,
			2,
			8
		], [
			0,
			1,
			0,
			0
		], [
			0,
			0,
			0,
			1
		])
	],
	bassPatterns: [bass([
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		2,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	]), bass([
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		4,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	])],
	percPatterns: [perc({
		kick: [
			2,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		snare: [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		hat: [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			1,
			0
		],
		click: [
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			2,
			0,
			0,
			0
		]
	})],
	arpTicks: [0, 8],
	densityRange: [.28, .58],
	variationProbability: .22,
	cadenceEveryBars: 16,
	timbre: {
		padCutoff: 2400,
		padDetune: 6,
		pluckCutoff: 3800,
		bassCutoff: 700,
		leadCutoff: 3400,
		bellInharmonic: .4,
		noiseAmount: .04,
		brightness: .82,
		space: .84
	},
	sectionWeights: {
		INTRO: 1.3,
		A: 1.3,
		A_VARIATION: 1,
		B: 1.1,
		BUILD: .3,
		PEAK: .25,
		RECOVERY: 1.2
	},
	melodyRegister: [72, 93],
	bassRegister: [38, 50],
	padRegister: [55, 79],
	restBias: .12,
	swing: 0
};
var LAVANDA = {
	id: "lavanda",
	name: "Lavanda",
	identity: "Unusual, alien, dreamlike geometry. Strange but beautiful.",
	tempoRange: [80, 90],
	scales: [
		"dorian",
		"lydian",
		"melodicMinor"
	],
	tonicPcs: [
		4,
		9,
		1,
		6,
		11
	],
	chordVocab: [
		chord(1, "minadd9"),
		chord(4, "maj7"),
		chord(7, "sus2"),
		chord(2, "min7"),
		chord(6, "maj7"),
		chord(5, "sus4"),
		chord(1, "sus2add6"),
		chord(3, "maj7")
	],
	progressionGraph: {
		"I:minadd9": [
			edge("IV:maj7", .32),
			edge("VII:sus2", .24),
			edge("VI:maj7", .24),
			edge("I:sus2add6", .2)
		],
		"I:sus2add6": [
			edge("IV:maj7", .4),
			edge("II:min7", .3),
			edge("III:maj7", .3)
		],
		"IV:maj7": [
			edge("VII:sus2", .34),
			edge("I:minadd9", .28),
			edge("II:min7", .2),
			edge("V:sus4", .18)
		],
		"VII:sus2": [
			edge("I:minadd9", .4),
			edge("VI:maj7", .3),
			edge("IV:maj7", .3)
		],
		"II:min7": [
			edge("V:sus4", .4),
			edge("IV:maj7", .3),
			edge("I:sus2add6", .3)
		],
		"VI:maj7": [
			edge("IV:maj7", .36),
			edge("I:minadd9", .32),
			edge("III:maj7", .32)
		],
		"V:sus4": [
			edge("I:minadd9", .4),
			edge("VII:sus2", .3),
			edge("II:min7", .3)
		],
		"III:maj7": [edge("IV:maj7", .5), edge("VI:maj7", .5)]
	},
	preferredProgressionLengths: [8, 8],
	motifs: [
		motif("lavanda-geo", [
			0,
			3,
			6,
			4,
			1,
			4
		], [
			3,
			3,
			2,
			2,
			2,
			4
		], [
			1,
			0,
			1,
			0,
			0,
			1
		]),
		motif("lavanda-float", [
			4,
			6,
			3,
			0,
			2
		], [
			3,
			3,
			2,
			4,
			4
		], [
			0,
			1,
			0,
			0,
			0
		]),
		motif("lavanda-drift", [
			1,
			4,
			2,
			6,
			4,
			0
		], [
			2,
			4,
			2,
			2,
			2,
			4
		], [
			0,
			1,
			0,
			0,
			1,
			0
		])
	],
	bassPatterns: [bass([
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		2,
		0,
		0,
		0,
		3,
		0
	]), bass([
		1,
		0,
		0,
		0,
		0,
		0,
		2,
		0,
		0,
		0,
		0,
		0,
		4,
		0,
		0,
		0
	])],
	percPatterns: [perc({
		kick: [
			2,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0
		],
		snare: [
			0,
			0,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			1
		],
		hat: [
			0,
			1,
			0,
			0,
			1,
			0,
			0,
			1,
			0,
			1,
			0,
			0,
			1,
			0,
			0,
			1
		],
		click: [
			0,
			0,
			0,
			2,
			0,
			0,
			0,
			0,
			0,
			0,
			2,
			0,
			0,
			0,
			0,
			0
		]
	})],
	arpTicks: [
		0,
		3,
		6,
		9,
		12,
		15
	],
	densityRange: [.36, .76],
	variationProbability: .42,
	cadenceEveryBars: 8,
	timbre: {
		padCutoff: 1750,
		padDetune: 14,
		pluckCutoff: 2800,
		bassCutoff: 720,
		leadCutoff: 2400,
		bellInharmonic: .32,
		noiseAmount: .1,
		brightness: .58,
		space: .7
	},
	sectionWeights: {
		INTRO: 1.1,
		A: 1.2,
		A_VARIATION: 1.3,
		B: 1.2,
		BUILD: .7,
		PEAK: .6,
		RECOVERY: 1
	},
	melodyRegister: [69, 88],
	bassRegister: [37, 49],
	padRegister: [52, 76],
	restBias: .1,
	swing: .02
};
var MENTA = {
	id: "menta",
	name: "Menta",
	identity: "Beginning, discovery, calm optimism, living and luminous.",
	tempoRange: [74, 80],
	scales: [
		"lydian",
		"majorPentatonic",
		"major"
	],
	tonicPcs: [
		0,
		2,
		5,
		7,
		9
	],
	chordVocab: [
		chord(1, "add9"),
		chord(1, "maj7"),
		chord(2, "sus2"),
		chord(4, "maj7"),
		chord(5, "sus2"),
		chord(6, "sus4"),
		chord(3, "min7"),
		chord(1, "sus2")
	],
	progressionGraph: {
		"I:add9": [
			edge("IV:maj7", .34),
			edge("II:sus2", .28),
			edge("VI:sus4", .2),
			edge("III:min7", .18)
		],
		"I:maj7": [
			edge("II:sus2", .3),
			edge("IV:maj7", .35),
			edge("I:add9", .35)
		],
		"I:sus2": [edge("I:add9", .5), edge("IV:maj7", .5)],
		"II:sus2": [
			edge("IV:maj7", .4),
			edge("I:add9", .3),
			edge("V:sus2", .3)
		],
		"IV:maj7": [
			edge("I:add9", .32),
			edge("V:sus2", .24),
			edge("II:sus2", .24),
			edge("VI:sus4", .2)
		],
		"V:sus2": [
			edge("I:add9", .45),
			edge("VI:sus4", .25),
			edge("IV:maj7", .3)
		],
		"VI:sus4": [
			edge("IV:maj7", .4),
			edge("II:sus2", .3),
			edge("I:add9", .3)
		],
		"III:min7": [
			edge("IV:maj7", .5),
			edge("II:sus2", .25),
			edge("I:add9", .25)
		]
	},
	preferredProgressionLengths: [
		8,
		8,
		4
	],
	motifs: [
		motif("menta-horizon", [
			0,
			4,
			2,
			7,
			4
		], [
			4,
			2,
			2,
			4,
			4
		], [
			1,
			0,
			0,
			1,
			0
		]),
		motif("menta-breath", [
			4,
			2,
			0,
			2,
			4
		], [
			4,
			2,
			4,
			2,
			4
		], [
			1,
			0,
			0,
			0,
			0
		], [
			0,
			0,
			1,
			0,
			0
		]),
		motif("menta-fifth", [
			0,
			4,
			7,
			4,
			0
		], [
			2,
			2,
			4,
			2,
			6
		], [
			0,
			0,
			1,
			0,
			1
		])
	],
	bassPatterns: [bass([
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		2,
		0,
		0,
		0,
		0,
		0,
		3,
		0
	]), bass([
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		4,
		0,
		0,
		0
	])],
	percPatterns: [perc({
		kick: [
			2,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		snare: [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0
		],
		hat: [
			0,
			0,
			1,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			1,
			0
		],
		click: [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			1,
			0
		]
	})],
	arpTicks: [
		0,
		4,
		8,
		12
	],
	densityRange: [.32, .68],
	variationProbability: .28,
	cadenceEveryBars: 8,
	timbre: {
		padCutoff: 1900,
		padDetune: 8,
		pluckCutoff: 2600,
		bassCutoff: 780,
		leadCutoff: 2600,
		bellInharmonic: .16,
		noiseAmount: .05,
		brightness: .62,
		space: .58
	},
	sectionWeights: {
		INTRO: 1,
		A: 1.4,
		A_VARIATION: 1,
		B: 1,
		BUILD: .5,
		PEAK: .4,
		RECOVERY: .8
	},
	melodyRegister: [67, 84],
	bassRegister: [36, 48],
	padRegister: [50, 74],
	restBias: .1,
	swing: .04
};
var CURATED_THEMES = {
	menta: MENTA,
	durazno: DURAZNO,
	lavanda: LAVANDA,
	glaciar: GLACIAR,
	eclipse: ECLIPSE
};
var MOOD_SCALES = {
	calm: [
		"lydian",
		"majorPentatonic",
		"dorian"
	],
	hopeful: [
		"major",
		"lydian",
		"mixolydian"
	],
	mysterious: [
		"dorian",
		"lydian",
		"melodicMinor"
	],
	tense: [
		"phrygian",
		"harmonicMinor",
		"dorian"
	],
	dark: [
		"phrygian",
		"aeolian",
		"harmonicMinor"
	],
	energetic: [
		"mixolydian",
		"major",
		"dorian"
	]
};
var COLOR_FOR_MOOD = {
	calm: ["luminous", "crystal"],
	hopeful: ["luminous", "warm"],
	mysterious: ["alien", "crystal"],
	tense: ["shadow", "hybrid"],
	dark: ["shadow", "hybrid"],
	energetic: ["warm", "luminous"]
};
var FAMILY_GRAPH = {
	"lydian-horizon": MENTA,
	"mixo-groove": DURAZNO,
	"dorian-geo": LAVANDA,
	"aeolian-crystal": GLACIAR,
	"phrygian-shadow": ECLIPSE,
	"hybrid-orbit": LAVANDA
};
function compatibleColor(profile, rng) {
	const moodColors = COLOR_FOR_MOOD[profile.mood];
	if (profile.mood === "hopeful" && profile.biome === "lava") return "hybrid";
	if (profile.biome === "lava" || profile.biome === "storm" || profile.danger > .72) return rng.weighted([{
		item: "shadow",
		weight: .7
	}, {
		item: "hybrid",
		weight: .3
	}]);
	if (profile.biome === "glacial" || profile.biome === "crystal") return rng.weighted([{
		item: "crystal",
		weight: .65
	}, {
		item: "alien",
		weight: .35
	}]);
	if (profile.mood === "dark" && profile.luminosity > .7) return "hybrid";
	return rng.pick(moodColors);
}
function familyFor(color, energy) {
	if (color === "warm") return energy > .55 ? "mixo-groove" : "lydian-horizon";
	if (color === "alien") return "dorian-geo";
	if (color === "crystal") return "aeolian-crystal";
	if (color === "shadow") return "phrygian-shadow";
	if (color === "hybrid") return "hybrid-orbit";
	return "lydian-horizon";
}
function bassPersonalityFor(profile, energy, color) {
	if (profile.biome === "dead" || color === "crystal" && energy < .4) return "sparse";
	if (color === "shadow" || profile.biome === "lava") return energy > .55 ? "syncopated" : "pulse";
	if (color === "warm" || profile.mood === "energetic") return energy > .5 ? "walking" : "pulse";
	if (energy < .35) return "drone";
	return "pulse";
}
function rhythmPersonalityFor(profile, energy, color) {
	if (color === "crystal") return "crystal";
	if (color === "alien") return "displaced";
	if (color === "shadow" || profile.biome === "storm") return "drive";
	if (color === "warm" || profile.mood === "energetic") return "groove";
	if (energy < .32) return "air";
	return energy > .7 ? "groove" : "air";
}
function motifFromDna(seed, color, energy, rng) {
	const length = 4 + rng.nextInt(4);
	const intervals = color === "shadow" ? [
		0,
		1,
		3,
		4,
		0
	] : color === "alien" ? [
		0,
		3,
		6,
		4,
		1,
		4
	] : color === "crystal" ? [
		0,
		4,
		7,
		4
	] : color === "warm" ? [
		0,
		2,
		0,
		4,
		2,
		5
	] : color === "hybrid" ? [
		0,
		3,
		2,
		6,
		4
	] : [
		0,
		4,
		2,
		7,
		4
	];
	const contour = [];
	let idx = rng.nextInt(intervals.length);
	for (let i = 0; i < length; i++) {
		contour.push(intervals[idx % intervals.length] + (energy > .7 && i === length - 1 ? 7 : 0));
		idx += rng.pick([
			1,
			1,
			2,
			-1
		]);
		if (idx < 0) idx = 0;
	}
	if (color === "shadow") contour[0] = 0;
	if (color === "luminous" && contour[1] !== void 0) contour[1] = 4;
	if (contour.length > 1 && color !== "shadow" && color !== "alien") contour[contour.length - 1] = rng.pick([
		0,
		4,
		0
	]);
	const rhythm = contour.map((_, i) => i === 0 ? energy > .55 ? 2 : 4 : rng.pick([
		2,
		2,
		4,
		1
	]));
	const accents = contour.map((_, i) => i === 0 || i === 2 && energy > .45);
	const rests = contour.map((_, i) => i === 1 && energy < .35 && color !== "warm");
	return motif(`${seed.slice(0, 12)}-core`, contour, rhythm, accents.map((v) => v ? 1 : 0), rests.map((v) => v ? 1 : 0));
}
var BASS = {
	drone: [bass([
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	]), bass([
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		4,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	])],
	walking: [bass([
		1,
		0,
		0,
		0,
		1,
		0,
		3,
		0,
		2,
		0,
		0,
		0,
		1,
		0,
		5,
		0
	]), bass([
		1,
		0,
		0,
		1,
		0,
		0,
		1,
		0,
		0,
		0,
		2,
		0,
		3,
		0,
		1,
		0
	])],
	pulse: [bass([
		1,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		2,
		0,
		0,
		0,
		1,
		0,
		0,
		0
	]), bass([
		1,
		0,
		0,
		0,
		0,
		0,
		1,
		0,
		2,
		0,
		0,
		0,
		4,
		0,
		0,
		0
	])],
	syncopated: [bass([
		1,
		0,
		1,
		0,
		0,
		0,
		1,
		0,
		2,
		0,
		0,
		0,
		3,
		0,
		1,
		0
	]), bass([
		1,
		0,
		0,
		1,
		1,
		0,
		0,
		0,
		1,
		0,
		2,
		0,
		1,
		0,
		3,
		0
	])],
	sparse: [bass([
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	]), bass([
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		2,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	])]
};
var PERC = {
	air: [perc({
		kick: [
			2,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		snare: [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0
		],
		hat: [
			0,
			0,
			1,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			1,
			0
		],
		click: [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			1,
			0
		]
	})],
	groove: [perc({
		kick: [
			2,
			0,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			1,
			2,
			0,
			0,
			1
		],
		snare: [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			2,
			0,
			0,
			0,
			0,
			1,
			0,
			0
		],
		hat: [
			1,
			0,
			2,
			0,
			1,
			0,
			2,
			1,
			1,
			0,
			2,
			0,
			1,
			0,
			2,
			0
		],
		click: [
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			1,
			0
		]
	})],
	displaced: [perc({
		kick: [
			2,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0
		],
		snare: [
			0,
			0,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			1
		],
		hat: [
			0,
			1,
			0,
			0,
			1,
			0,
			0,
			1,
			0,
			1,
			0,
			0,
			1,
			0,
			0,
			1
		],
		click: [
			0,
			0,
			0,
			2,
			0,
			0,
			0,
			0,
			0,
			0,
			2,
			0,
			0,
			0,
			0,
			0
		]
	})],
	crystal: [perc({
		kick: [
			1,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		snare: [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		hat: [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			1,
			0
		],
		click: [
			0,
			0,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			0,
			2,
			0,
			0,
			0
		]
	})],
	drive: [perc({
		kick: [
			2,
			0,
			1,
			0,
			0,
			0,
			2,
			0,
			2,
			0,
			0,
			1,
			0,
			0,
			1,
			0
		],
		snare: [
			0,
			0,
			0,
			0,
			2,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			2,
			0,
			0,
			0
		],
		hat: [
			1,
			1,
			2,
			1,
			1,
			0,
			2,
			1,
			1,
			1,
			2,
			1,
			1,
			0,
			2,
			3
		],
		click: [
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			2
		]
	})]
};
function generatePlanetDna(profile) {
	const intensity = clamp01(profile.intensity);
	const luminosity = clamp01(profile.luminosity);
	const danger = clamp01(profile.danger);
	const anomaly = clamp01(profile.anomaly);
	const rng = createPrng(`dna:${profile.seed}:${profile.biome}:${profile.mood}`);
	const energy = clamp01(intensity * .7 + (profile.mood === "energetic" ? .25 : 0) + danger * .15);
	const tension = clamp01((profile.mood === "dark" || profile.mood === "tense" ? .55 : .15) + danger * .4 + anomaly * .15);
	const color = compatibleColor(profile, rng);
	const family = familyFor(color, energy);
	const scales = MOOD_SCALES[profile.mood];
	const mode = rng.pick(color === "shadow" ? [
		"phrygian",
		"harmonicMinor",
		"aeolian"
	] : scales);
	const tempoMin = lerp(66, 100, energy);
	const tempo = Math.round(tempoMin + rng.nextRange(-3, 4) + (profile.mood === "energetic" ? 6 : 0));
	const tonic = rng.pick([
		0,
		2,
		4,
		5,
		7,
		9,
		11
	]);
	const bassPersonality = bassPersonalityFor(profile, energy, color);
	const rhythmPersonality = rhythmPersonalityFor(profile, energy, color);
	const spaceSize = color === "crystal" ? lerp(1.35, 1.6, 1 - energy) : color === "warm" ? lerp(.7, .95, 1 - energy) : lerp(1.05, 1.4, anomaly);
	return {
		seed: profile.seed,
		tempo: Math.max(62, Math.min(118, tempo)),
		tonic,
		mode,
		harmonicColor: color,
		progressionFamily: family,
		motifDNA: motifFromDna(profile.seed, color, energy, rng.fork("motif")),
		bassPersonality,
		rhythmPersonality,
		timbreProfile: {
			padCutoff: lerp(1400, 2e3, luminosity),
			padDetune: lerp(5, 14, anomaly),
			pluckCutoff: lerp(1400, 2800, luminosity),
			bassCutoff: lerp(260, 620, clamp01(profile.temperature)),
			leadCutoff: lerp(1100, 2100, luminosity),
			bellInharmonic: clamp01(.1 + (profile.biome === "crystal" ? .3 : 0) + anomaly * .22),
			noiseAmount: clamp01(.04 + (profile.biome === "storm" ? .16 : 0) + danger * .08),
			brightness: clamp01(.28 + luminosity * .52),
			space: clamp01(.32 + (1 - energy) * .4 + (profile.biome === "ocean" ? .12 : 0))
		},
		spaceProfile: {
			size: Math.min(1.4, spaceSize),
			damp: color === "crystal" ? .34 : color === "shadow" ? .55 : .44,
			wet: clamp01(Math.min(.2, .12 + (1 - energy) * .1 + (color === "alien" || color === "crystal" ? .06 : 0))),
			preDelay: color === "crystal" ? .03 : color === "warm" ? .008 : .018
		},
		tension,
		energy,
		luminosity
	};
}
function themeFromDna(dna) {
	const family = FAMILY_GRAPH[dna.progressionFamily] ?? LAVANDA;
	const id = dna.harmonicColor === "warm" ? "durazno" : dna.harmonicColor === "shadow" ? "eclipse" : dna.harmonicColor === "crystal" ? "glaciar" : dna.harmonicColor === "alien" || dna.harmonicColor === "hybrid" ? "lavanda" : "menta";
	const secondary = motif(`${dna.motifDNA.id}-b`, dna.motifDNA.contour.slice().reverse().map((d, i) => i === 0 ? d : Math.max(0, d - 1)), dna.motifDNA.rhythm, dna.motifDNA.accents.map((v) => v ? 1 : 0), dna.motifDNA.rests.map((v) => v ? 1 : 0));
	const arp = dna.rhythmPersonality === "displaced" ? [
		0,
		3,
		6,
		9,
		12,
		15
	] : dna.rhythmPersonality === "drive" ? [
		0,
		2,
		4,
		8,
		10,
		12
	] : dna.rhythmPersonality === "crystal" ? [0, 8] : dna.energy > .6 ? [
		0,
		2,
		4,
		6,
		8,
		10,
		12,
		14
	] : [
		0,
		4,
		8,
		12
	];
	return {
		id,
		name: "Procedural planet",
		identity: `${dna.harmonicColor} ${dna.bassPersonality} ${dna.rhythmPersonality}`,
		tempoRange: [Math.max(60, dna.tempo - 4), dna.tempo + 4],
		scales: [dna.mode],
		tonicPcs: [dna.tonic],
		chordVocab: family.chordVocab.map((c) => ({ ...c })),
		progressionGraph: family.progressionGraph,
		preferredProgressionLengths: family.preferredProgressionLengths,
		motifs: [
			dna.motifDNA,
			secondary,
			family.motifs[2] ?? dna.motifDNA
		],
		bassPatterns: BASS[dna.bassPersonality],
		percPatterns: PERC[dna.rhythmPersonality],
		arpTicks: arp,
		densityRange: [clamp01(.16 + dna.energy * .28), clamp01(.42 + dna.energy * .48 + dna.tension * .1)],
		variationProbability: clamp01(.22 + dna.tension * .2),
		cadenceEveryBars: dna.rhythmPersonality === "crystal" ? 16 : 8,
		timbre: dna.timbreProfile,
		sectionWeights: family.sectionWeights,
		melodyRegister: [Math.round(lerp(57, 72, dna.luminosity)), Math.round(lerp(76, 93, dna.luminosity))],
		bassRegister: [36, 50],
		padRegister: [Math.round(lerp(44, 55, dna.luminosity)), Math.round(lerp(67, 79, dna.luminosity))],
		restBias: clamp01(.12 + (1 - dna.energy) * .22),
		swing: dna.rhythmPersonality === "groove" ? .08 : dna.rhythmPersonality === "displaced" ? .03 : .04
	};
}
function campaignDna(options) {
	const id = options.themeId;
	const mix = MIX_PROFILES[id];
	const color = id === "menta" ? "luminous" : id === "durazno" ? "warm" : id === "lavanda" ? "alien" : id === "glaciar" ? "crystal" : "shadow";
	const bassPersonality = id === "menta" ? "drone" : id === "durazno" ? "walking" : id === "lavanda" ? "pulse" : id === "glaciar" ? "sparse" : "syncopated";
	const rhythmPersonality = id === "menta" ? "air" : id === "durazno" ? "groove" : id === "lavanda" ? "displaced" : id === "glaciar" ? "crystal" : "drive";
	const energy = id === "eclipse" ? .82 : id === "durazno" ? .7 : id === "glaciar" ? .28 : id === "lavanda" ? .48 : .4;
	const tension = id === "eclipse" ? .78 : id === "lavanda" ? .42 : id === "glaciar" ? .22 : .18;
	const luminosity = id === "menta" ? .72 : id === "glaciar" ? .8 : id === "eclipse" ? .28 : id === "durazno" ? .62 : .5;
	return {
		seed: options.seed,
		tempo: options.tempo,
		tonic: options.tonic,
		mode: options.scale,
		harmonicColor: color,
		progressionFamily: id === "menta" ? "lydian-horizon" : id === "durazno" ? "mixo-groove" : id === "lavanda" ? "dorian-geo" : id === "glaciar" ? "aeolian-crystal" : "phrygian-shadow",
		motifDNA: options.motif,
		bassPersonality,
		rhythmPersonality,
		timbreProfile: options.timbre,
		spaceProfile: mix.space,
		tension,
		energy,
		luminosity
	};
}
function fam(id, purpose, sectionFit, chords, cadence, destinations) {
	return {
		id,
		purpose,
		sectionFit,
		chords,
		cadence,
		destinations
	};
}
var MENTA_FAMILIES = [
	fam("horizon-open", "Tonic horizon that leaves the door open", [
		"A",
		"A_VARIATION",
		"B"
	], [
		chord(1, "add9", 0, 2),
		chord(4, "maj7", 0, 2),
		chord(2, "sus2", 0, 2),
		chord(1, "add9", 0, 2)
	], "open", ["lift-half", "home-resolved"]),
	fam("lift-half", "Rises to a suspended dominant and waits", [
		"A_VARIATION",
		"B",
		"BUILD"
	], [
		chord(1, "add9", 0, 2),
		chord(6, "sus4", 0, 2),
		chord(4, "maj7", 0, 2),
		chord(5, "sus2", 0, 2)
	], "half", ["return-home", "horizon-open"]),
	fam("home-resolved", "Clear return to tonic after a short journey", [
		"A",
		"PEAK",
		"RECOVERY"
	], [
		chord(1, "maj7", 0, 2),
		chord(2, "sus2", 0, 2),
		chord(4, "maj7", 0, 2),
		chord(1, "add9", 0, 2)
	], "resolved", ["horizon-open", "wonder-slow"]),
	fam("wonder-slow", "Held tonic, then a gentle lift", [
		"INTRO",
		"B",
		"RECOVERY"
	], [
		chord(1, "add9", 0, 4),
		chord(3, "min7", 0, 2),
		chord(4, "maj7", 0, 2)
	], "open", ["horizon-open", "return-home"]),
	fam("return-home", "Cadential arrival used at climax and close", [
		"BUILD",
		"PEAK",
		"RECOVERY"
	], [
		chord(4, "maj7", 0, 2),
		chord(5, "sus2", 0, 2),
		chord(1, "add9", 0, 4)
	], "resolved", ["home-resolved", "horizon-open"])
];
var DURAZNO_FAMILIES = [
	fam("groove-home", "Warm I–IV–V loop with a landing", [
		"A",
		"A_VARIATION",
		"PEAK"
	], [
		chord(1, "maj6", 0, 2),
		chord(4, "add9", 0, 2),
		chord(5, "sus4", 0, 2),
		chord(1, "maj6", 0, 2)
	], "resolved", ["bounce-half", "playful-bVII"]),
	fam("bounce-half", "Faster harmonic rhythm that stops on V", [
		"A_VARIATION",
		"B",
		"BUILD"
	], [
		chord(1, "add9", 0, 1),
		chord(2, "min7", 0, 1),
		chord(4, "maj6", 0, 2),
		chord(5, "sus4", 0, 2),
		chord(1, "maj6", 0, 2)
	], "half", ["groove-home", "land-resolved"]),
	fam("playful-bVII", "Mixolydian side-step, still anchored", ["B", "A"], [
		chord(1, "maj6", 0, 2),
		chord(7, "min7", -1, 2),
		chord(4, "add9", 0, 2),
		chord(1, "maj6", 0, 2)
	], "open", ["groove-home", "drive-up"]),
	fam("drive-up", "Builds toward a half cadence", ["BUILD", "B"], [
		chord(1, "add9", 0, 2),
		chord(3, "min7", 0, 2),
		chord(2, "min7", 0, 2),
		chord(5, "sus4", 0, 2)
	], "half", ["land-resolved", "groove-home"]),
	fam("land-resolved", "IV–V–I arrival", [
		"PEAK",
		"RECOVERY",
		"INTRO"
	], [
		chord(4, "add9", 0, 2),
		chord(5, "sus4", 0, 2),
		chord(1, "maj6", 0, 4)
	], "resolved", ["groove-home"])
];
var LAVANDA_FAMILIES = [
	fam("pedal-i", "Held modal tonic, one color at a time", [
		"INTRO",
		"A",
		"RECOVERY"
	], [chord(1, "minadd9", 0, 4), chord(4, "maj7", 0, 4)], "open", ["float-vii", "suspended-v"]),
	fam("float-vii", "Geometric drift around VII and VI", [
		"A",
		"A_VARIATION",
		"B"
	], [
		chord(1, "minadd9", 0, 2),
		chord(7, "sus2", 0, 2),
		chord(6, "maj7", 0, 2),
		chord(1, "minadd9", 0, 2)
	], "open", ["geo-sus", "pedal-i"]),
	fam("geo-sus", "Suspended add6 color, then home", [
		"A_VARIATION",
		"B",
		"PEAK"
	], [
		chord(1, "sus2add6", 0, 2),
		chord(4, "maj7", 0, 2),
		chord(3, "maj7", 0, 2),
		chord(1, "minadd9", 0, 2)
	], "resolved", ["pedal-i", "drift-open"]),
	fam("suspended-v", "Long V pedal that finally yields", [
		"BUILD",
		"PEAK",
		"B"
	], [chord(5, "sus4", 0, 4), chord(1, "minadd9", 0, 4)], "suspended", ["geo-sus", "pedal-i"]),
	fam("drift-open", "Leaves the door ajar on VII", ["B", "A_VARIATION"], [
		chord(2, "min7", 0, 2),
		chord(5, "sus4", 0, 2),
		chord(4, "maj7", 0, 2),
		chord(7, "sus2", 0, 2)
	], "open", ["float-vii", "pedal-i"])
];
var GLACIAR_FAMILIES = [
	fam("ice-pedal", "Four bars of tonic ice, then relative major light", [
		"INTRO",
		"A",
		"RECOVERY"
	], [chord(1, "minadd9", 0, 4), chord(6, "maj7", 0, 4)], "open", ["crystal-arch", "long-iii"]),
	fam("crystal-arch", "Slow i–iv–VI–i arch", [
		"A",
		"A_VARIATION",
		"B"
	], [
		chord(1, "minadd9", 0, 2),
		chord(4, "min7", 0, 2),
		chord(6, "maj7", 0, 2),
		chord(1, "minadd9", 0, 2)
	], "resolved", ["ice-pedal", "thaw"]),
	fam("long-iii", "Very slow two-chord thought", ["B", "RECOVERY"], [chord(1, "min7", 0, 4), chord(3, "maj7", 0, 4)], "open", ["crystal-arch", "sparkle-pedal"]),
	fam("thaw", "iv–V–i arrival over a long tonic", [
		"BUILD",
		"PEAK",
		"A_VARIATION"
	], [
		chord(4, "min7", 0, 2),
		chord(5, "sus4", 0, 2),
		chord(1, "minadd9", 0, 4)
	], "resolved", ["ice-pedal"]),
	fam("sparkle-pedal", "Single chord — melody and bells do the work", [
		"INTRO",
		"RECOVERY",
		"A"
	], [chord(1, "minadd9", 0, 8)], "open", ["crystal-arch", "ice-pedal"])
];
var ECLIPSE_FAMILIES = [
	fam("phrygian-home", "Present bII, then insist on i", [
		"A",
		"INTRO",
		"RECOVERY"
	], [
		chord(1, "min", 0, 2),
		chord(2, "maj", -1, 2),
		chord(1, "min", 0, 4)
	], "resolved", ["prepare-bii", "unleash"]),
	fam("prepare-bii", "Prepare the dark step, return home", [
		"A",
		"A_VARIATION",
		"B"
	], [
		chord(1, "min", 0, 2),
		chord(4, "min7", 0, 2),
		chord(2, "maj", -1, 2),
		chord(1, "min", 0, 2)
	], "resolved", ["unleash", "deceive"]),
	fam("unleash", "Dominant pressure, then release to i", ["BUILD", "PEAK"], [
		chord(2, "maj", -1, 2),
		chord(5, "dom7", 0, 2),
		chord(1, "min", 0, 2),
		chord(1, "minadd9", 0, 2)
	], "resolved", ["phrygian-home", "release-i"]),
	fam("deceive", "Walks away from tonic on purpose", ["B", "A_VARIATION"], [
		chord(1, "min", 0, 2),
		chord(2, "maj", -1, 2),
		chord(6, "min", 0, 2),
		chord(7, "maj", -1, 2)
	], "deceptive", ["unleash", "phrygian-home"]),
	fam("release-i", "Climactic V/bII collapse into i", ["PEAK", "RECOVERY"], [
		chord(5, "dom7", 0, 2),
		chord(2, "maj", -1, 2),
		chord(1, "min", 0, 4)
	], "resolved", ["phrygian-home"])
];
var GRAMMARS = {
	menta: {
		id: "lydian-horizon",
		world: "menta",
		families: MENTA_FAMILIES,
		dissonanceBudget: 1,
		harmonicRhythmBars: {
			INTRO: 4,
			A: 2,
			A_VARIATION: 2,
			B: 2,
			BUILD: 2,
			PEAK: 2,
			RECOVERY: 4
		},
		palette: {
			pad: true,
			pulse: true,
			pluck: true,
			lead: true,
			bell: true,
			arp: false,
			bass: true,
			kick: true,
			snare: false,
			hat: true
		},
		rhythmGrid: {
			id: "air",
			strong: [0, 8],
			secondary: [4, 12],
			offbeat: [
				2,
				6,
				10,
				14
			],
			syncopation: []
		},
		registerZones: {
			bass: [36, 48],
			pad: [50, 72],
			ostinato: [55, 67],
			motif: [67, 84],
			counter: [74, 91],
			pickup: [79, 96]
		},
		defaultArc: "rise-peak-resolve",
		defaultBass: "pedal",
		ostinatoTicks: [
			0,
			4,
			8,
			12
		],
		restBars: [3]
	},
	durazno: {
		id: "mixo-groove",
		world: "durazno",
		families: DURAZNO_FAMILIES,
		dissonanceBudget: 1,
		harmonicRhythmBars: {
			INTRO: 2,
			A: 2,
			A_VARIATION: 1,
			B: 2,
			BUILD: 1,
			PEAK: 2,
			RECOVERY: 2
		},
		palette: {
			pad: true,
			pulse: true,
			pluck: true,
			lead: false,
			bell: false,
			arp: false,
			bass: true,
			kick: true,
			snare: true,
			hat: true
		},
		rhythmGrid: {
			id: "groove",
			strong: [0, 8],
			secondary: [4, 12],
			offbeat: [6, 14],
			syncopation: [
				6,
				11,
				14
			]
		},
		registerZones: {
			bass: [36, 50],
			pad: [48, 67],
			ostinato: [52, 64],
			motif: [64, 81],
			counter: [76, 91],
			pickup: [76, 93]
		},
		defaultArc: "low-repeat-expand",
		defaultBass: "groove-cell",
		ostinatoTicks: [
			0,
			4,
			8,
			12
		],
		restBars: []
	},
	lavanda: {
		id: "dorian-geo",
		world: "lavanda",
		families: LAVANDA_FAMILIES,
		dissonanceBudget: 2,
		harmonicRhythmBars: {
			INTRO: 4,
			A: 2,
			A_VARIATION: 2,
			B: 2,
			BUILD: 4,
			PEAK: 2,
			RECOVERY: 4
		},
		palette: {
			pad: true,
			pulse: true,
			pluck: false,
			lead: true,
			bell: true,
			arp: true,
			bass: true,
			kick: true,
			snare: false,
			hat: true
		},
		rhythmGrid: {
			id: "displaced",
			strong: [0, 12],
			secondary: [6],
			offbeat: [
				3,
				9,
				15
			],
			syncopation: [3, 9]
		},
		registerZones: {
			bass: [37, 49],
			pad: [52, 76],
			ostinato: [60, 76],
			motif: [69, 88],
			counter: [55, 67],
			pickup: [81, 98]
		},
		defaultArc: "question-answer",
		defaultBass: "root-motion",
		ostinatoTicks: [
			0,
			3,
			6,
			9,
			12,
			15
		],
		restBars: [5]
	},
	glaciar: {
		id: "aeolian-crystal",
		world: "glaciar",
		families: GLACIAR_FAMILIES,
		dissonanceBudget: 1,
		harmonicRhythmBars: {
			INTRO: 4,
			A: 4,
			A_VARIATION: 2,
			B: 4,
			BUILD: 2,
			PEAK: 2,
			RECOVERY: 4
		},
		palette: {
			pad: true,
			pulse: false,
			pluck: false,
			lead: false,
			bell: true,
			arp: false,
			bass: true,
			kick: true,
			snare: false,
			hat: false
		},
		rhythmGrid: {
			id: "crystal",
			strong: [0],
			secondary: [8],
			offbeat: [12],
			syncopation: []
		},
		registerZones: {
			bass: [38, 50],
			pad: [55, 79],
			ostinato: [67, 79],
			motif: [72, 93],
			counter: [60, 72],
			pickup: [84, 98]
		},
		defaultArc: "sparse-bell",
		defaultBass: "pedal",
		ostinatoTicks: [0, 8],
		restBars: [
			1,
			3,
			5
		]
	},
	eclipse: {
		id: "phrygian-shadow",
		world: "eclipse",
		families: ECLIPSE_FAMILIES,
		dissonanceBudget: 3,
		harmonicRhythmBars: {
			INTRO: 2,
			A: 2,
			A_VARIATION: 2,
			B: 2,
			BUILD: 1,
			PEAK: 2,
			RECOVERY: 2
		},
		palette: {
			pad: true,
			pulse: true,
			pluck: true,
			lead: true,
			bell: false,
			arp: true,
			bass: true,
			kick: true,
			snare: true,
			hat: true
		},
		rhythmGrid: {
			id: "drive",
			strong: [0, 8],
			secondary: [
				4,
				6,
				12
			],
			offbeat: [2, 10],
			syncopation: [
				2,
				6,
				11
			]
		},
		registerZones: {
			bass: [36, 48],
			pad: [43, 67],
			ostinato: [48, 60],
			motif: [60, 79],
			counter: [72, 86],
			pickup: [72, 91]
		},
		defaultArc: "stable-tension-release",
		defaultBass: "root-motion",
		ostinatoTicks: [
			0,
			4,
			8,
			12
		],
		restBars: [3]
	}
};
var FAMILY_ALIAS = {
	"lydian-horizon": "menta",
	"mixo-groove": "durazno",
	"dorian-geo": "lavanda",
	"aeolian-crystal": "glaciar",
	"phrygian-shadow": "eclipse",
	"hybrid-orbit": "lavanda",
	menta: "menta",
	durazno: "durazno",
	lavanda: "lavanda",
	glaciar: "glaciar",
	eclipse: "eclipse"
};
function grammarFor(id) {
	return GRAMMARS[FAMILY_ALIAS[id] ?? "lavanda"];
}
function pickFamilyForSection(grammar, section, rng) {
	const fit = grammar.families.filter((family) => family.sectionFit.includes(section));
	const pool = fit.length ? fit : grammar.families;
	if (section === "A" || section === "INTRO") return pool[0];
	if (section === "PEAK") return pool.find((family) => family.cadence === "resolved") ?? pool[0];
	if (section === "RECOVERY") return pool.find((family) => family.cadence === "resolved" || family.cadence === "open") ?? pool[0];
	return rng.pick(pool);
}
function dissonanceBudgetFor(grammar, section) {
	const base = grammar.dissonanceBudget;
	if (section === "PEAK" || section === "BUILD") return Math.min(4, base + 1);
	if (section === "INTRO" || section === "RECOVERY" || section === "TRANSITION") return Math.max(0, base - 1);
	return base;
}
function spaceWetFor(section) {
	switch (section) {
		case "INTRO": return 1.25;
		case "A": return 1;
		case "A_VARIATION": return .95;
		case "B": return 1.08;
		case "BUILD": return 1.18;
		case "PEAK": return .82;
		case "RECOVERY": return 1.32;
		case "TRANSITION": return 1.2;
		default: return 1;
	}
}
function cadenceForSection(grammar, section, family) {
	if (section === "INTRO") return "open";
	if (section === "BUILD") return "suspended";
	if (section === "PEAK") return family.cadence === "deceptive" ? "deceptive" : "resolved";
	if (section === "RECOVERY") return "resolved";
	if (section === "TRANSITION") return "open";
	return family.cadence;
}
function motifStageFor(section, phraseIndex) {
	if (section === "INTRO" || section === "RECOVERY") return "prime";
	if (section === "A" && phraseIndex <= 1) return "prime";
	if (section === "A_VARIATION") return "repeat";
	if (section === "A") return "develop";
	if (section === "B" || section === "BUILD") return "develop";
	if (section === "PEAK") return "transform";
	return "repeat";
}
var SECTION_BARS = {
	INTRO: 4,
	A: 8,
	A_VARIATION: 8,
	B: 8,
	BUILD: 4,
	PEAK: 8,
	RECOVERY: 8,
	TRANSITION: 2
};
function phraseLengthFor(section) {
	return SECTION_BARS[section] <= 4 ? SECTION_BARS[section] : 8;
}
function sectionAtBarFromSequence(sequence, barIndex) {
	const cycle = sequence.reduce((sum, s) => sum + s.bars, 0) || 1;
	let cursor = (barIndex % cycle + cycle) % cycle;
	for (const section of sequence) {
		if (cursor < section.bars) return {
			id: section.id,
			localBar: cursor
		};
		cursor -= section.bars;
	}
	return {
		id: "A",
		localBar: 0
	};
}
function phraseWindow(session, barIndex, forceSection) {
	const info = forceSection ? {
		id: forceSection,
		localBar: (barIndex % SECTION_BARS[forceSection] + SECTION_BARS[forceSection]) % SECTION_BARS[forceSection]
	} : sectionAtBarFromSequence(session.sectionSequence, barIndex);
	const length = phraseLengthFor(info.id);
	const phraseLocal = Math.floor(info.localBar / length) * length;
	const startBar = forceSection ? barIndex - barIndex % length : barIndex - (info.localBar - phraseLocal);
	const cycle = session.sectionSequence.reduce((sum, s) => sum + s.bars, 0) || 56;
	const abs = (startBar % cycle + cycle) % cycle;
	let cursor = 0;
	let phraseIndex = 0;
	for (const section of session.sectionSequence) {
		const plen = phraseLengthFor(section.id);
		const count = Math.max(1, Math.ceil(section.bars / plen));
		if (abs < cursor + section.bars) {
			phraseIndex += Math.floor((abs - cursor) / plen);
			break;
		}
		phraseIndex += count;
		cursor += section.bars;
	}
	return {
		section: info.id,
		localBar: info.localBar,
		startBar,
		length,
		phraseIndex
	};
}
function roleFor(local, length, section) {
	if (section === "RECOVERY" && local % 2 === 1) return "breath";
	if (length <= 4) {
		if (local <= 1) return "statement";
		if (section === "BUILD") return local === length - 1 ? "cadence" : "development";
		return local === length - 1 ? "cadence" : "response";
	}
	if (local <= 1) return "statement";
	if (local <= 3) return "response";
	if (local <= 5) return "development";
	return "cadence";
}
function arcFor(grammar, section) {
	if (grammar.world === "glaciar") return "sparse-bell";
	if (grammar.world === "lavanda") return "question-answer";
	if (grammar.world === "eclipse") return "stable-tension-release";
	if (grammar.world === "durazno") return section === "B" ? "low-repeat-expand" : "rise-peak-resolve";
	if (section === "INTRO") return "low-repeat-expand";
	if (section === "PEAK") return "rise-peak-resolve";
	return grammar.defaultArc;
}
function bassRoleFor(grammar, section, role) {
	if (grammar.world === "glaciar") return "pedal";
	if (grammar.world === "durazno" && section !== "INTRO" && section !== "RECOVERY") return "groove-cell";
	if (section === "INTRO" || section === "RECOVERY") return "pedal";
	if (role === "cadence") return "root-motion";
	if (grammar.world === "eclipse" && (section === "PEAK" || section === "BUILD")) return "octave-pulse";
	if (grammar.world === "menta" && section === "A") return "root-motion";
	return grammar.defaultBass;
}
function tensionOwnerFor(grammar, section, role) {
	if (grammar.dissonanceBudget <= 1) {
		if (role === "development" || section === "B") return "lead";
		return "none";
	}
	if (grammar.world === "lavanda") return role === "statement" ? "pad" : "lead";
	if (grammar.world === "eclipse") {
		if (section === "PEAK" || section === "BUILD") return "lead";
		if (role === "cadence") return "none";
		return "pad";
	}
	return "none";
}
function melodyActive(grammar, section, role, local, intensity) {
	if (section === "TRANSITION") return false;
	if (role === "breath") return false;
	if (section === "INTRO" && local > 0 && intensity < .18) return false;
	if (grammar.world === "glaciar" && grammar.restBars.includes(local % 8) && role !== "statement") return false;
	if (grammar.world === "menta" && local === 3 && section !== "PEAK") return false;
	if (grammar.world === "lavanda" && local === 5 && section !== "PEAK") return false;
	if (grammar.world === "eclipse" && local === 3 && (section === "A" || section === "A_VARIATION")) return false;
	if (section === "RECOVERY" && local % 2 === 1) return false;
	return true;
}
function counterActive(melodyOn, section, role, intensity, combo, grammar) {
	if (section === "TRANSITION" || section === "INTRO") return false;
	if (grammar.world === "glaciar") return !melodyOn && role !== "breath";
	if (section === "PEAK") return !melodyOn || role === "response" || role === "development";
	if (section === "BUILD" && intensity > .45) return !melodyOn || role === "cadence";
	if (section === "B" && combo >= 12 && intensity > .55) return !melodyOn;
	if (melodyOn) return false;
	return role === "response" || role === "breath";
}
function arpActive(grammar, section, intensity, role) {
	if (section === "RECOVERY" || section === "TRANSITION" || section === "INTRO") return false;
	if (!grammar.palette.arp && grammar.world !== "lavanda") {
		if (grammar.world === "durazno") return (section === "BUILD" || section === "PEAK") && intensity >= .55;
		if (grammar.world === "eclipse") return section === "PEAK" || section === "BUILD";
		return false;
	}
	if (grammar.world === "lavanda") return role !== "breath";
	if (role === "cadence") return false;
	return intensity >= .38;
}
function phrasePlanFor(session, barIndex, intensity, combo, forceSection) {
	const window = phraseWindow(session, barIndex, forceSection);
	const section = window.section;
	const grammar = grammarFor(session.themeId === "procedural" ? session.dna.progressionFamily : session.themeId);
	const familyId = session.familyBySection?.[section] ?? grammar.families[0].id;
	const family = grammar.families.find((item) => item.id === familyId) ?? grammar.families[0];
	const cadence = session.cadenceBySection?.[section] ?? cadenceForSection(grammar, section, family);
	const stage = motifStageFor(section, window.phraseIndex);
	const contour = arcFor(grammar, section);
	const budget = dissonanceBudgetFor(grammar, section);
	const motif = section === "B" ? session.motifs[1] ?? session.motifs[0] : session.motifs[0];
	const progression = session.progressions[section] ?? family.chords;
	const space = spaceWetFor(section);
	const bars = [];
	for (let i = 0; i < window.length; i++) {
		const role = roleFor(i, window.length, section);
		const melodyOn = melodyActive(grammar, section, role, i, intensity);
		const dropPerc = section === "PEAK" && i === 4;
		const fill = section === "BUILD" && i === window.length - 1 || section === "PEAK" && i === window.length - 1;
		const owner = tensionOwnerFor(grammar, section, role);
		const bass = bassRoleFor(grammar, section, role);
		const dir = contour === "sparse-bell" ? 0 : contour === "question-answer" ? role === "statement" || role === "development" ? 1 : -1 : contour === "rise-peak-resolve" ? role === "cadence" ? -1 : 1 : role === "development" ? 1 : 0;
		bars.push({
			localBar: i,
			role,
			melodyActive: melodyOn,
			counterActive: counterActive(melodyOn, section, role, intensity, combo, grammar),
			arpActive: arpActive(grammar, section, intensity, role) && !dropPerc,
			pulseActive: !(section === "RECOVERY" && grammar.world !== "durazno") && !(grammar.world === "menta" && intensity < .12),
			percDensity: dropPerc ? .08 : percDensity(grammar, section, intensity, i),
			bassRole: bass,
			fill,
			tensionOwner: owner,
			spaceWet: space,
			motifStage: i <= 1 && stage === "transform" ? "repeat" : stage,
			melodyStartTick: i === 1 && section !== "INTRO" ? 2 : 0,
			melodyDirection: dir
		});
	}
	return {
		phraseIndex: window.phraseIndex,
		section,
		startBar: window.startBar,
		length: window.length,
		tonalCenterPc: session.tonicPc,
		cadence,
		familyId,
		progression,
		motifId: motif.id,
		motifStage: stage,
		contour,
		bassRole: bassRoleFor(grammar, section, "statement"),
		rhythmCell: grammar.rhythmGrid.id,
		orchestration: {
			harmony: true,
			bass: true,
			melody: bars.some((b) => b.melodyActive),
			counter: bars.some((b) => b.counterActive),
			arp: bars.some((b) => b.arpActive),
			percussion: bars.some((b) => b.percDensity > .15),
			atmosphere: true,
			gameplay: true
		},
		dissonanceBudget: budget,
		tensionOwner: tensionOwnerFor(grammar, section, "statement"),
		bars
	};
}
function percDensity(grammar, section, intensity, local) {
	const base = section === "INTRO" ? .22 : section === "A" ? .55 : section === "A_VARIATION" ? .62 : section === "B" ? .58 : section === "BUILD" ? .82 : section === "PEAK" ? .95 : section === "RECOVERY" ? .18 : .1;
	const worldBoost = grammar.world === "durazno" || grammar.world === "eclipse" ? .18 : 0;
	const late = local === 7 ? .08 : 0;
	return Math.max(.08, Math.min(1, base * (.45 + intensity * .7) + worldBoost + late));
}
function barPlanFrom(phrase, localBar) {
	return phrase.bars[localBar % phrase.bars.length] ?? phrase.bars[0];
}
function summarizePhrase(session, phrase, localBar) {
	const bar = barPlanFrom(phrase, localBar);
	return {
		section: phrase.section,
		phraseIndex: phrase.phraseIndex,
		startBar: phrase.startBar,
		length: phrase.length,
		tonalCenter: pcName(phrase.tonalCenterPc),
		chords: uniqueChordLabels(session, phrase.progression),
		cadence: phrase.cadence,
		motifVersion: `${phrase.motifId}:${phrase.motifStage}`,
		contour: phrase.contour,
		bassRole: phrase.bassRole,
		orchestration: Object.keys(phrase.orchestration).filter((key) => phrase.orchestration[key]),
		tensionOwner: bar.tensionOwner,
		dissonanceBudget: phrase.dissonanceBudget,
		role: bar.role
	};
}
function uniqueChordLabels(session, chords) {
	const out = [];
	let last = "";
	for (const symbol of chords) {
		const label = `${formatChord(session.tonicPc, session.scale, symbol)} (${chordKey(symbol)})`;
		if (label !== last) out.push(label);
		last = label;
	}
	return out;
}
function nextPhraseStart(session, barIndex) {
	const window = phraseWindow(session, barIndex);
	return window.startBar + window.length;
}
function createSession(options) {
	const seed = options.seed || "ORB-DEFAULT";
	const variationSeed = options.variationSeed ?? `${seed}::v0`;
	const identityRng = createPrng(seed);
	const variationRng = createPrng(variationSeed);
	let theme;
	let tempo;
	let tonicPc;
	let scale;
	let dna;
	let motifs;
	if (options.themeId === "procedural") {
		dna = generatePlanetDna(options.profile ?? {
			seed,
			biome: "mixed",
			mood: "mysterious",
			intensity: .45,
			temperature: .5,
			luminosity: .55,
			danger: .25,
			anomaly: .4
		});
		theme = themeFromDna(dna);
		tempo = dna.tempo;
		tonicPc = dna.tonic;
		scale = dna.mode;
		motifs = theme.motifs.map((motif) => ({
			...motif,
			contour: [...motif.contour]
		}));
	} else {
		theme = structuredClone(CURATED_THEMES[options.themeId]);
		tempo = Math.round(identityRng.nextRange(theme.tempoRange[0], theme.tempoRange[1]));
		tonicPc = identityRng.pick(theme.tonicPcs);
		scale = identityRng.pick(theme.scales);
		motifs = theme.motifs.map((motif) => ({
			...motif,
			contour: [...motif.contour]
		}));
		dna = campaignDna({
			themeId: options.themeId,
			seed,
			tempo,
			tonic: tonicPc,
			scale,
			motif: motifs[0],
			timbre: theme.timbre
		});
	}
	const grammar = grammarFor(options.themeId === "procedural" ? dna.progressionFamily : options.themeId);
	const progressions = {};
	const familyBySection = {};
	const cadenceBySection = {};
	for (const section of uniqueSections()) {
		const bars = SECTION_BARS[section];
		const family = pickFamilyForSection(grammar, section, identityRng.fork(`fam:${section}`));
		progressions[section] = flattenProgression(family.chords, bars);
		familyBySection[section] = family.id;
		cadenceBySection[section] = family.cadence;
	}
	const sectionSequence = SECTION_ORDER.map((id) => ({
		id,
		bars: SECTION_BARS[id]
	}));
	return {
		seed,
		variationSeed,
		themeId: options.themeId,
		theme,
		tempo,
		tonicPc,
		scale,
		motifs,
		progressions,
		sectionSequence,
		profile: options.profile,
		dna,
		identityRng,
		variationRng,
		grammarId: grammar.id,
		familyBySection,
		cadenceBySection
	};
}
function uniqueSections() {
	return [
		"INTRO",
		"A",
		"A_VARIATION",
		"B",
		"BUILD",
		"PEAK",
		"RECOVERY",
		"TRANSITION"
	];
}
function sectionAtBar(session, barIndex) {
	return sectionAtBarFromSequence(session.sectionSequence, barIndex);
}
function chordAtBar(session, section, localBar, previous) {
	const seq = session.progressions[section] ?? session.progressions.A;
	const symbol = seq[localBar % seq.length] ?? session.theme.chordVocab[0];
	return voiceChord({
		tonicPc: session.tonicPc,
		scale: session.scale,
		symbol,
		previous,
		lowMidi: session.theme.padRegister[0],
		highMidi: session.theme.padRegister[1],
		bassOctave: 2
	});
}
function modeModifiers(mode) {
	switch (mode) {
		case "calm": return {
			density: .55,
			percussion: .25,
			tension: .35,
			space: 1.35,
			pulse: .55,
			instability: .1
		};
		case "daily": return {
			density: 1,
			percussion: 1,
			tension: .9,
			space: .95,
			pulse: 1.15,
			instability: .12
		};
		case "infinite": return {
			density: 1,
			percussion: .95,
			tension: 1,
			space: 1.05,
			pulse: 1,
			instability: .2
		};
		case "anomaly": return {
			density: 1.05,
			percussion: 1.05,
			tension: 1.2,
			space: 1.1,
			pulse: .9,
			instability: .7
		};
		default: return {
			density: 1,
			percussion: 1,
			tension: 1,
			space: 1,
			pulse: 1,
			instability: .15
		};
	}
}
function exportPlan(session) {
	const progressions = uniqueSections().map((section) => ({
		section,
		chords: (session.progressions[section] ?? []).map((symbol) => `${formatChord(session.tonicPc, session.scale, symbol)} (${chordKey(symbol)})`)
	}));
	return {
		seed: session.seed,
		variationSeed: session.variationSeed,
		theme: session.themeId,
		tempo: session.tempo,
		tonicPc: session.tonicPc,
		keyName: pcName(session.tonicPc),
		scale: session.scale,
		motifs: session.motifs,
		progressions,
		sections: session.sectionSequence,
		instrumentConfiguration: session.theme.timbre,
		planetProfile: session.profile,
		dna: session.dna,
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		grammarId: session.grammarId,
		families: uniqueSections().map((section) => ({
			section,
			familyId: session.familyBySection[section] ?? "",
			cadence: session.cadenceBySection[section] ?? "open"
		})),
		phrases: collectPhrases(session)
	};
}
function collectPhrases(session) {
	const out = [];
	let bar = 0;
	const seen = /* @__PURE__ */ new Set();
	for (const section of session.sectionSequence) {
		const plan = phrasePlanFor(session, bar, .5, 0);
		if (!seen.has(plan.startBar)) {
			seen.add(plan.startBar);
			out.push(summarizePhrase(session, plan, 0));
		}
		bar += section.bars;
	}
	return out;
}
var SECTION_BASE = {
	INTRO: .4,
	A: .64,
	A_VARIATION: .72,
	B: .7,
	BUILD: .9,
	PEAK: 1,
	RECOVERY: .38,
	TRANSITION: .24
};
var PRIORITY = {
	pickup: 10,
	event: 9,
	lead: 8,
	bass: 7,
	kick: 6,
	pluck: 6,
	pad: 5,
	bell: 4,
	snare: 4,
	arp: 3,
	hat: 2,
	click: 2,
	noise: 1
};
function composeBar(ctx) {
	const { session } = ctx;
	const composer = ctx.composer !== false;
	const sectionInfo = ctx.forceSection ? {
		id: ctx.forceSection,
		localBar: ctx.barIndex
	} : sectionAtBar(session, ctx.barIndex);
	const section = sectionInfo.id;
	const voicing = chordAtBar(session, section, sectionInfo.localBar, ctx.previousVoicing?.midi);
	const rng = createPrng(`${session.variationSeed}::bar:${ctx.barIndex}::${section}`);
	const mode = modeModifiers(ctx.mode);
	const energy = clamp01(SECTION_BASE[section] * .48 + ctx.intensity * .74);
	const density = clamp01(Math.max(.28, energy * mode.density));
	const phrase = composer && section !== "TRANSITION" ? phrasePlanFor(session, ctx.barIndex, ctx.intensity, ctx.combo, ctx.forceSection) : null;
	const plan = phrase ? barPlanFrom(phrase, sectionInfo.localBar) : null;
	const percAmt = clamp01(.28 + energy * mode.percussion * (session.theme.densityRange[0] + density * .9));
	const notes = [];
	const isFill = plan ? plan.fill : sectionInfo.localBar === 7 && energy > .48 && rng.chance(.62 + ctx.intensity * .28);
	const world = session.themeId;
	const polish = ctx.polish !== false;
	const policy = tensionPolicyFor(world, session.scale, {
		anomaly: ctx.mode === "anomaly",
		tension: session.dna.tension
	});
	const chordChanged = Boolean(ctx.previousVoicing && ctx.previousVoicing.pitchClasses.join(",") !== voicing.pitchClasses.join(","));
	if (section === "TRANSITION") addTransitionPivot(notes, voicing, ctx.incomingVoicing, session, chordChanged);
	else {
		addPad(notes, voicing, density, mode.space, section, ctx.intensity, world, chordChanged, plan);
		addBass(notes, voicing, session, density, rng, section, mode.pulse, ctx.intensity, polish, plan);
		addPulse(notes, voicing, session, density, section, ctx.intensity, plan);
		addShimmer(notes, voicing, world, section, ctx.intensity, ctx.barIndex, polish);
		addPercussion(notes, session, plan ? plan.percDensity : percAmt, rng, isFill, mode, ctx.intensity, world, section, composer);
		addMelody(notes, voicing, session, ctx, section, density, rng, policy, polish, plan, sectionInfo.localBar);
		addArp(notes, voicing, session, density, rng, ctx.combo, section, ctx.intensity, plan);
		if (ctx.pickupContour && ctx.pickupContour.length >= 3 && (plan ? plan.role === "response" && ctx.combo >= 8 : rng.chance(.3 + Math.min(.4, ctx.combo / 28)))) addPickupEcho(notes, voicing, session, ctx.pickupContour, rng, policy, polish);
		if ((plan ? plan.counterActive : section === "PEAK" || section === "BUILD" && ctx.intensity > .45 || section === "B" && ctx.combo >= 12 && ctx.intensity > .55) && (plan || rng.chance(.82))) addCounter(notes, voicing, session, ctx, rng, policy, polish, plan);
	}
	let scored = notes.filter((n) => Number.isFinite(n.midi) && n.velocity > 0 && n.durationTicks > 0);
	if (polish && section !== "TRANSITION") {
		scored = polishPhrase(scored, voicing, session.tonicPc, session.scale, policy, [
			"lead",
			"pluck",
			"bell",
			"pickup"
		]);
		scored = polishPhrase(scored, voicing, session.tonicPc, session.scale, policy, ["bass"]);
	}
	for (const note of scored) {
		if (note.priority === void 0) note.priority = priorityFor(note.voice, section, world);
		if (composer) note.velocity = humanizeVel(note.velocity, note.tick);
	}
	return {
		barIndex: ctx.barIndex,
		section,
		chord: voicing,
		notes: scored,
		isFill,
		phrase: phrase ? summarizePhrase(session, phrase, sectionInfo.localBar) : void 0
	};
}
function humanizeVel(value, tick) {
	return clamp01(value * (.97 + tick * 3 % 5 * .006));
}
function priorityFor(voice, section, world) {
	if (world === "glaciar" && voice === "bell") return 8;
	if (world === "durazno" && voice === "pluck" && section !== "INTRO") return 8;
	if (voice === "bell" && (section === "PEAK" || section === "BUILD")) return 3;
	return PRIORITY[voice];
}
function addTransitionPivot(notes, outgoing, incoming, session, _chordChanged) {
	const dest = incoming ?? outgoing;
	const tones = incoming ? commonToneMidis(outgoing, incoming, session.theme.padRegister) : outgoing.midi.slice(0, 2);
	const vel = .72;
	for (let i = 0; i < Math.min(2, tones.length); i++) notes.push({
		tick: 0,
		durationTicks: 12,
		midi: tones[i],
		velocity: vel * (i === 0 ? 1 : .82),
		voice: "pad",
		pan: i === 0 ? -.18 : .18,
		priority: 5,
		layer: "harmony"
	});
	notes.push({
		tick: 0,
		durationTicks: 8,
		midi: Math.max(36, outgoing.bassMidi),
		velocity: .78,
		voice: "bass",
		priority: 7,
		layer: "bass"
	});
	notes.push({
		tick: 8,
		durationTicks: 8,
		midi: Math.max(36, dest.bassMidi),
		velocity: .82,
		voice: "bass",
		priority: 7,
		layer: "bass"
	});
	const pivot = tones[0] ?? dest.rootMidi;
	notes.push({
		tick: 4,
		durationTicks: 6,
		midi: nearestMidi((dest.pitchClasses[2] ?? dest.rootMidi) % 12, Math.min(84, pivot + 12)),
		velocity: .5,
		voice: "bell",
		pan: .12,
		priority: 4,
		layer: "atmosphere"
	});
}
function addPad(notes, voicing, density, _space, section, intensity, world, chordChanged, plan) {
	const vel = clamp01(.84 + density * .14 + (section === "PEAK" ? .06 : 0) + (world === "glaciar" ? .06 : 0));
	const hold = chordChanged ? 14 : world === "glaciar" || section === "RECOVERY" ? 16 : 15;
	const count = plan?.tensionOwner === "lead" ? Math.min(3, voicing.midi.length) : section === "INTRO" && intensity < .28 ? 2 : 3;
	const tones = voicing.midi.slice(0, count);
	for (let i = 0; i < tones.length; i++) notes.push({
		tick: 0,
		durationTicks: hold,
		midi: tones[i],
		velocity: vel * (i === 0 ? 1 : i === 1 ? .9 : .78),
		voice: "pad",
		pan: (i / Math.max(1, tones.length - 1) - .5) * .48,
		priority: 5,
		layer: "harmony"
	});
	if ((section === "PEAK" || world === "eclipse" && intensity >= .62 && section !== "INTRO") && tones[0]) {
		const sub = tones[0] - 12;
		if (sub >= 43) notes.push({
			tick: 0,
			durationTicks: hold,
			midi: sub,
			velocity: vel * .58,
			voice: "pad",
			pan: 0,
			priority: 4,
			layer: "harmony"
		});
	}
}
function addBass(notes, voicing, session, density, rng, section, pulse, intensity, polish, plan) {
	const role = plan?.bassRole ?? (session.themeId === "durazno" ? "groove-cell" : "root-motion");
	const steps = ((section === "A_VARIATION" || section === "B" || intensity > .55) && session.theme.bassPatterns[1] ? session.theme.bassPatterns[1] : session.theme.bassPatterns[0]).steps;
	const root = Math.max(36, voicing.bassMidi);
	const fifth = nearestMidi((voicing.pitchClasses[2] ?? root + 7) % 12, root + 7);
	const third = nearestMidi((voicing.pitchClasses[1] ?? root) % 12, root + 4);
	const octave = Math.min(51, root + 12);
	const approach = nearestScaleMidi(root - 2, session.tonicPc, session.scale);
	const driving = session.themeId === "durazno" || session.themeId === "eclipse";
	const push = (tick, midi, dur, vel) => {
		notes.push({
			tick,
			durationTicks: dur,
			midi: clampMidi(Math.max(36, midi)),
			velocity: vel,
			voice: "bass",
			priority: 7,
			layer: "bass"
		});
	};
	if (role === "pedal" || section === "INTRO" && intensity < .28 && !driving && !plan) {
		push(0, root, 15, .92);
		push(8, fifth, 6, .72);
		return;
	}
	if (role === "octave-pulse") {
		push(0, root, 5, .94);
		push(4, root, 3, .78);
		push(8, octave, 5, .88);
		push(12, fifth, 3, .74);
		return;
	}
	if (role === "inversion") {
		push(0, third, 8, .86);
		push(8, root, 6, .9);
		return;
	}
	for (let tick = 0; tick < 16; tick++) {
		let code = steps[tick % steps.length] ?? 0;
		if (code === 0) continue;
		if (!driving && density < .32 && tick % 8 !== 0) continue;
		if (!driving && pulse < .5 && tick % 4 !== 0 && code !== 1) continue;
		if (section === "RECOVERY" && tick % 8 !== 0) continue;
		if (role === "root-motion" && isBeatTick(tick) && (code === 3 || code === 5)) code = 1;
		if (polish && isBeatTick(tick) && code === 3) code = 1;
		let midi = root;
		if (code === 2) midi = fifth;
		else if (code === 3) midi = approach;
		else if (code === 4) midi = octave;
		else if (code === 5) midi = third;
		if (polish && code === 3 && (isBeatTick(tick) || isHarshAgainstChord(midi, voicing))) midi = fifth;
		if (plan && isBeatTick(tick) && !isChordTone(midi, voicing)) midi = root;
		push(tick, Math.max(36, midi), code === 1 && tick % 4 === 0 ? 5 : 3, .86 + (tick === 0 ? .1 : 0) * pulse);
	}
}
function addPulse(notes, voicing, session, density, section, intensity, plan) {
	if (section === "TRANSITION") return;
	if (plan && !plan.pulseActive) return;
	const world = session.themeId;
	if (section === "RECOVERY" && world !== "durazno") {
		notes.push({
			tick: 0,
			durationTicks: 4,
			midi: nearestMidi((voicing.pitchClasses[2] ?? voicing.rootMidi) % 12, session.theme.melodyRegister[0] - 3),
			velocity: .42,
			voice: world === "glaciar" ? "bell" : "pluck",
			pan: -.18,
			priority: 3,
			layer: "atmosphere"
		});
		return;
	}
	if (intensity < .12 && world === "menta") return;
	const fifth = nearestMidi((voicing.pitchClasses[2] ?? voicing.rootMidi) % 12, session.theme.melodyRegister[0] - 5);
	const step = world === "lavanda" ? 3 : world === "glaciar" ? 8 : 4;
	const vel = .5 + intensity * .22 + (world === "durazno" ? .1 : 0);
	for (let tick = 0; tick < 16; tick += step) notes.push({
		tick,
		durationTicks: world === "glaciar" ? 4 : 2,
		midi: fifth,
		velocity: vel,
		voice: world === "glaciar" ? "bell" : world === "lavanda" ? "arp" : "pluck",
		pan: tick % 8 === 0 ? -.24 : .24,
		priority: 3,
		layer: world === "lavanda" ? "arp" : "atmosphere"
	});
}
function addShimmer(notes, voicing, world, section, intensity, barIndex, polish) {
	if (section === "TRANSITION") return;
	const topRaw = Math.min(96, (voicing.midi[voicing.midi.length - 1] ?? voicing.rootMidi + 12) + (world === "glaciar" ? 12 : 7));
	const top = polish ? nearestChordTone(topRaw, voicing) : topRaw;
	if (world === "glaciar") {
		notes.push({
			tick: 0,
			durationTicks: 10,
			midi: top,
			velocity: .7 + (section === "PEAK" ? .1 : 0),
			voice: "bell",
			pan: .32,
			priority: 8,
			layer: "atmosphere"
		});
		if (section !== "INTRO" && section !== "RECOVERY") {
			const second = polish ? nearestChordTone(Math.max(72, top - 7), voicing) : Math.max(72, top - 7);
			notes.push({
				tick: 8,
				durationTicks: 5,
				midi: second,
				velocity: .5,
				voice: "bell",
				pan: -.28,
				priority: 4,
				layer: "atmosphere"
			});
		}
		return;
	}
	if (world === "lavanda" && (barIndex % 2 === 0 || intensity > .4)) notes.push({
		tick: 3,
		durationTicks: 4,
		midi: top,
		velocity: .48,
		voice: "bell",
		pan: .4,
		priority: 3,
		layer: "atmosphere"
	});
	if (world === "menta" && section !== "INTRO" && barIndex % 4 === 0) {
		const sparkle = polish ? nearestChordTone(Math.min(88, voicing.rootMidi + 19), voicing) : Math.min(88, voicing.rootMidi + 19);
		notes.push({
			tick: 8,
			durationTicks: 6,
			midi: sparkle,
			velocity: .46,
			voice: "bell",
			pan: .2,
			priority: 3,
			layer: "atmosphere"
		});
	}
}
function addPercussion(notes, session, percAmt, rng, isFill, mode, intensity, world, section, composer) {
	if (section === "TRANSITION") return;
	const pattern = session.theme.percPatterns[0];
	const rotate = section === "B" ? 2 : 0;
	const at = (arr, tick) => arr[(tick + rotate) % arr.length] ?? 0;
	const amount = Math.max(world === "durazno" || world === "eclipse" ? .42 : world === "glaciar" ? .24 : world === "lavanda" ? .3 : .26, percAmt);
	if (section === "RECOVERY") {
		notes.push({
			tick: 0,
			durationTicks: 2,
			midi: 92,
			velocity: .5,
			voice: "click",
			priority: 2,
			layer: "percussion"
		});
		if (world === "glaciar" || world === "lavanda") notes.push({
			tick: 8,
			durationTicks: 2,
			midi: 91,
			velocity: .48,
			voice: "bell",
			priority: 3,
			layer: "atmosphere"
		});
		if (world === "durazno" || world === "eclipse") {
			notes.push({
				tick: 0,
				durationTicks: 3,
				midi: 36,
				velocity: .7,
				voice: "kick",
				priority: 6,
				layer: "percussion"
			});
			notes.push({
				tick: 8,
				durationTicks: 2,
				midi: 48,
				velocity: .5,
				voice: "snare",
				priority: 4,
				layer: "percussion"
			});
		}
		return;
	}
	const voiceFor = (kind) => {
		if (kind === "kick") return "kick";
		if (kind === "snare") return "snare";
		if (kind === "hat" || kind === "hatOpen") return "hat";
		return "click";
	};
	const place = (kind, tick, step) => {
		if (step <= 0) return;
		if (amount < (kind === "hat" ? .1 : kind === "kick" ? .03 : .12) && step < 2 && world !== "durazno" && world !== "eclipse") return;
		if (kind === "hat" && intensity < .18 && world === "menta") return;
		if (kind === "hat" && section === "INTRO" && intensity < .35 && world !== "durazno") return;
		if (kind === "hat" && intensity < .32 && step < 2 && world !== "durazno" && world !== "eclipse") return;
		if (kind === "snare" && intensity < .28 && world !== "durazno" && world !== "eclipse") return;
		notes.push({
			tick,
			durationTicks: kind === "kick" ? 3 : 1,
			midi: kind === "kick" ? 36 : kind === "snare" ? 48 : kind === "click" ? 94 : 80,
			velocity: (step >= 2 ? .96 : .72) * (kind === "hat" ? Math.max(.44, amount * mode.pulse) : amount),
			voice: voiceFor(kind),
			priority: kind === "kick" ? 6 : kind === "snare" ? 4 : 2,
			layer: "percussion"
		});
	};
	for (let tick = 0; tick < 16; tick++) {
		place("kick", tick, at(pattern.kick, tick));
		place("snare", tick, at(pattern.snare, tick));
		if (intensity >= .18 || world === "durazno" || world === "eclipse") place("hat", tick, at(pattern.hat, tick));
		place("click", tick, at(pattern.click, tick));
	}
	if (intensity >= .72 && world !== "glaciar" && section !== "INTRO") {
		for (const tick of [
			2,
			6,
			10,
			14
		]) if (!notes.some((n) => n.voice === "hat" && n.tick === tick)) notes.push({
			tick,
			durationTicks: 1,
			midi: 80,
			velocity: .4 + intensity * .2,
			voice: "hat",
			priority: 2,
			layer: "percussion"
		});
	}
	if (composer ? isFill : isFill || section === "BUILD" && rng.chance(.62) || section === "PEAK" && rng.chance(.45)) for (let tick = 12; tick < 16; tick++) notes.push({
		tick,
		durationTicks: 1,
		midi: tick % 2 === 0 ? 48 : 94,
		velocity: .66 + (tick - 12) * .06,
		voice: tick % 2 === 0 ? "snare" : "click",
		priority: tick % 2 === 0 ? 4 : 2,
		layer: "percussion"
	});
}
function addMelody(notes, voicing, session, ctx, section, density, rng, policy, polish, plan, localBar) {
	if (section === "TRANSITION") return;
	if (plan && !plan.melodyActive) return;
	const phraseBar = ctx.barIndex % 4;
	const signature = session.motifs[0];
	const secondary = session.motifs[1] ?? signature;
	let motif = section === "B" || section === "A_VARIATION" && phraseBar >= 2 ? secondary : signature;
	if (!plan) {
		if (section === "INTRO") {
			const cut = phraseBar === 0 ? 3 : signature.contour.length;
			motif = {
				...signature,
				contour: signature.contour.slice(0, cut),
				rhythm: signature.rhythm.slice(0, cut),
				rests: signature.rests.slice(0, cut),
				accents: signature.accents.slice(0, cut)
			};
		} else if (section === "RECOVERY" && phraseBar % 2 === 1) return;
		else if (ctx.intensity < .14 && phraseBar === 3) return;
		else if (rng.chance(session.theme.restBias * .22 * (1.05 - density))) return;
	} else if (section === "INTRO") {
		const cut = plan.role === "statement" ? Math.min(3, signature.contour.length) : signature.contour.length;
		motif = {
			...signature,
			contour: signature.contour.slice(0, cut),
			rhythm: signature.rhythm.slice(0, cut),
			rests: signature.rests.slice(0, cut),
			accents: signature.accents.slice(0, cut)
		};
	}
	const kind = plan ? variationForStage(plan.motifStage, localBar) : section === "A" && phraseBar === 0 ? "prime" : pickVariation(ctx.barIndex, rng);
	const realizedMotif = kind === "prime" ? motif : plan ? varyMotifComposed(motif, kind) : varyMotif(motif, kind, rng);
	const grammar = grammarFor(session.themeId === "procedural" ? session.dna.progressionFamily : session.themeId);
	const register = plan ? grammar.registerZones.motif : shiftRegister(session.theme.melodyRegister, ctx.combo, ctx.barIndex, section);
	const voice = session.themeId === "glaciar" ? "bell" : session.themeId === "durazno" ? "pluck" : "lead";
	const simpleLead = plan?.tensionOwner === "pad";
	const realized = realizeMotif({
		motif: realizedMotif,
		tonicPc: session.tonicPc,
		scale: session.scale,
		chord: voicing,
		register,
		startTick: plan ? plan.melodyStartTick : phraseBar === 1 && section !== "INTRO" ? 2 : 0,
		voice,
		velocity: .86 + density * .14,
		policy: simpleLead ? "strict" : policy,
		polish
	});
	for (const note of realized) {
		if (note.tick >= 16) continue;
		notes.push({
			...note,
			priority: 8,
			layer: "melody"
		});
	}
}
function addCounter(notes, voicing, session, ctx, rng, policy, polish, plan) {
	const grammar = grammarFor(session.themeId === "procedural" ? session.dna.progressionFamily : session.themeId);
	const sparse = Boolean(plan?.melodyActive);
	const motif = plan ? varyMotifComposed(session.motifs[0], plan.melodyDirection >= 0 ? "invert" : "fragment") : varyMotif(session.motifs[0], "response", rng);
	const register = plan ? grammar.registerZones.counter : shiftRegister([session.theme.melodyRegister[0] + 5, session.theme.melodyRegister[1] + 4], ctx.combo, ctx.barIndex, "PEAK");
	if (sparse) {
		const tone = nearestChordTone((voicing.midi[1] ?? voicing.rootMidi) + (plan?.melodyDirection === 1 ? -5 : 7), voicing);
		notes.push({
			tick: 8,
			durationTicks: 6,
			midi: clampMidi(Math.max(register[0], Math.min(register[1], tone))),
			velocity: .48,
			voice: "bell",
			pan: -.28,
			priority: 3,
			layer: "counter"
		});
		return;
	}
	const realized = realizeMotif({
		motif,
		tonicPc: session.tonicPc,
		scale: session.scale,
		chord: voicing,
		register,
		startTick: 8,
		voice: "bell",
		velocity: .56,
		policy,
		polish
	});
	notes.push(...realized.filter((n) => n.tick < 16).map((n) => ({
		...n,
		velocity: n.velocity * .85,
		priority: 3,
		layer: "counter"
	})));
}
function addArp(notes, voicing, session, density, rng, combo, section, intensity, plan) {
	if (section === "RECOVERY" || section === "TRANSITION") return;
	if (plan && !plan.arpActive) return;
	if (section === "INTRO" && intensity < .35) return;
	const world = session.themeId;
	if (!plan) {
		if (world !== "lavanda" && world !== "eclipse" && intensity < .22) return;
		if (world !== "lavanda" && density < .32 && intensity < .38) return;
		if (world === "durazno" && intensity < .55 && section !== "BUILD" && section !== "PEAK") return;
	}
	const grammar = grammarFor(world === "procedural" ? session.dna.progressionFamily : world);
	const ticks = plan ? grammar.ostinatoTicks : session.theme.arpTicks;
	const zones = grammar.registerZones.ostinato;
	const tones = chordTonesMidi(voicing, plan ? zones : [session.theme.melodyRegister[0] - 5, session.theme.melodyRegister[1] - 4]);
	if (tones.length === 0) return;
	const used = combo >= 8 || intensity > .58 || section === "PEAK" || section === "BUILD" || world === "lavanda" ? ticks : ticks.filter((_, i) => i % 2 === 0 || ticks.length <= 4);
	let dir = 1;
	let idx = plan ? 0 : rng.nextInt(tones.length);
	const vel = .52 + density * .2 + (world === "lavanda" ? .08 : 0);
	for (const tick of used) {
		notes.push({
			tick,
			durationTicks: 2,
			midi: tones[idx] ?? tones[0],
			velocity: vel,
			voice: world === "glaciar" || world === "lavanda" ? "bell" : "pluck",
			pan: (tick % 8 / 8 - .5) * .5,
			priority: 3,
			layer: "arp"
		});
		idx += dir;
		if (idx >= tones.length || idx < 0) {
			dir *= -1;
			idx = Math.max(0, Math.min(tones.length - 1, idx + dir));
		}
	}
}
function addPickupEcho(notes, voicing, session, contour, _rng, policy, polish) {
	const fragment = contour.slice(-4);
	let tick = 8;
	for (const midi of fragment) {
		let fitted = midi;
		if (polish) fitted = isBeatTick(tick) ? nearestChordTone(fitted, voicing) : chooseResolvedPickup(fitted, voicing, session.tonicPc, session.scale, policy);
		else if (!isChordTone(fitted, voicing)) fitted = nearestScaleMidi(fitted, session.tonicPc, session.scale);
		notes.push({
			tick,
			durationTicks: 2,
			midi: clampMidi(fitted),
			velocity: .55,
			voice: "bell",
			priority: 4,
			layer: "gameplay"
		});
		tick += 2;
		if (tick >= 16) break;
	}
}
function shiftRegister(register, combo, barIndex, section) {
	const comboLift = Math.min(7, Math.floor(combo / 10));
	const cycleLift = barIndex % 32 >= 24 ? 3 : 0;
	const sectionLift = section === "B" ? 3 : section === "PEAK" ? 5 : section === "RECOVERY" ? -2 : 0;
	return [register[0] + comboLift + cycleLift + sectionLift, register[1] + comboLift + cycleLift + sectionLift];
}
function choosePickupMidi(options) {
	const { voicing, combo, strongBeat, rng } = options;
	const policy = options.policy ?? "strict";
	const chordPool = chordTonesMidi(voicing, combo >= 20 ? [79, 96] : combo >= 8 ? [72, 88] : [67, 84]);
	const scaleExtra = nearestScaleMidi(voicing.rootMidi + 2, options.tonicPc, options.scale) + 12;
	const pool = strongBeat || combo < 4 ? chordPool : [...chordPool, ...policy === "strict" && isHarshAgainstChord(scaleExtra, voicing) ? [] : [scaleExtra]];
	const safe = pool.filter((midi) => !isHarshAgainstChord(midi, voicing) || policy !== "strict");
	return clampMidi(chooseResolvedPickup(safe.length ? rng.pick(safe) : pool.length ? rng.pick(pool) : voicing.rootMidi + 12, voicing, options.tonicPc, options.scale, policy));
}
function choosePickupHarmony(primary, voicing, tonicPc, scale, policy, rng) {
	const ok = chordTonesMidi(voicing, [Math.max(67, primary - 5), Math.min(98, primary + 12)]).filter((m) => m !== primary).filter((midi) => consonantPickupInterval(primary, midi, policy));
	if (ok.length) return clampMidi(rng.pick(ok));
	const fifth = nearestMidi((voicing.pitchClasses[2] ?? voicing.rootMidi) % 12, primary + 7);
	if (consonantPickupInterval(primary, fifth, policy)) return clampMidi(fifth);
	return null;
}
function playVoice(name, opts) {
	switch (name) {
		case "pad": return playPad(opts);
		case "pluck":
		case "arp": return playPluck(opts, name);
		case "bass": return playBass(opts);
		case "lead": return playLead(opts);
		case "bell": return playBell(opts);
		case "kick": return playKick(opts);
		case "snare": return playSnare(opts);
		case "hat": return playHat(opts);
		case "click": return playClick(opts);
		case "noise": return playNoise(opts);
		case "pickup": return playPickup(opts);
		case "event": return playEvent(opts);
		default: return playPluck(opts, "pluck");
	}
}
function peak(name, velocity) {
	const v = Number.isFinite(velocity) ? Math.max(.08, Math.min(1.2, velocity)) : .75;
	return VOICE_PEAK[name] * v;
}
function tapSend(opts, source) {
	if (!opts.send || !opts.sendGain || opts.sendGain <= .01) return [];
	const g = opts.ctx.createGain();
	g.gain.value = Math.max(0, Math.min(.7, opts.sendGain));
	source.connect(g);
	g.connect(opts.send);
	return [g];
}
function playPad(opts) {
	const { ctx, dest, time, midi, duration, velocity, timbre, intensity, pan } = opts;
	const freq = midiToFreq(midi);
	const cutoff = Math.max(1400, timbre.padCutoff * (.78 + intensity * .85));
	const mix = ctx.createGain();
	const lvl = peak("pad", velocity);
	mix.gain.setValueAtTime(1e-4, time);
	mix.gain.exponentialRampToValueAtTime(lvl, time + .07);
	mix.gain.setTargetAtTime(lvl * .9, time + .18, .2);
	const releaseAt = time + Math.max(.4, duration - (opts.cleanTails === false ? .35 : .1));
	mix.gain.setTargetAtTime(1e-4, releaseAt, opts.cleanTails === false ? .32 : .14);
	const filter = ctx.createBiquadFilter();
	filter.type = "lowpass";
	filter.frequency.setValueAtTime(cutoff * .85, time);
	filter.frequency.setTargetAtTime(cutoff, time + .4, .6);
	filter.Q.value = .5;
	const output = panNode(ctx, dest, pan);
	mix.connect(filter);
	filter.connect(output);
	const chorus = ctx.createDelay(.04);
	chorus.delayTime.value = .012;
	const lfo = ctx.createOscillator();
	lfo.type = "sine";
	lfo.frequency.value = .21;
	const lfoG = ctx.createGain();
	lfoG.gain.value = .0035;
	lfo.connect(lfoG);
	lfoG.connect(chorus.delayTime);
	const chorusG = ctx.createGain();
	chorusG.gain.value = .45;
	filter.connect(chorus);
	chorus.connect(chorusG);
	chorusG.connect(output);
	lfo.start(time);
	lfo.stop(time + duration + (opts.cleanTails === false ? .5 : .22));
	const nodes = [
		mix,
		filter,
		output,
		chorus,
		lfo,
		lfoG,
		chorusG,
		...tapSend(opts, output)
	];
	const layers = [
		{
			type: "sawtooth",
			detune: -timbre.padDetune,
			gain: .3,
			ratio: 1
		},
		{
			type: "triangle",
			detune: 0,
			gain: .44,
			ratio: 1
		},
		{
			type: "sawtooth",
			detune: timbre.padDetune,
			gain: .3,
			ratio: 1
		},
		{
			type: "sine",
			detune: 0,
			gain: .24,
			ratio: .5
		}
	];
	for (const layer of layers) {
		const osc = ctx.createOscillator();
		osc.type = layer.type;
		osc.frequency.value = freq * layer.ratio;
		osc.detune.value = layer.detune;
		const g = ctx.createGain();
		g.gain.value = layer.gain;
		osc.connect(g);
		g.connect(mix);
		osc.start(time);
		osc.stop(time + duration + (opts.cleanTails === false ? .35 : .18));
		nodes.push(osc, g);
	}
	return nodes;
}
function playPluck(opts, name) {
	const { ctx, dest, time, midi, duration, velocity, timbre, intensity, pan } = opts;
	const osc = ctx.createOscillator();
	osc.type = name === "arp" ? "triangle" : "sawtooth";
	osc.frequency.value = midiToFreq(midi);
	const body = ctx.createOscillator();
	body.type = "triangle";
	body.frequency.value = midiToFreq(midi);
	const filter = ctx.createBiquadFilter();
	filter.type = "lowpass";
	const startCut = Math.max(1600, timbre.pluckCutoff * (.9 + intensity * .45));
	filter.frequency.setValueAtTime(startCut, time);
	filter.frequency.exponentialRampToValueAtTime(Math.max(420, startCut * .28), time + Math.min(.32, duration));
	const mix = ctx.createGain();
	const o1 = ctx.createGain();
	o1.gain.value = .78;
	const o2 = ctx.createGain();
	o2.gain.value = .4;
	const gain = ctx.createGain();
	const lvl = peak(name, velocity);
	gain.gain.setValueAtTime(1e-4, time);
	gain.gain.exponentialRampToValueAtTime(lvl, time + .005);
	gain.gain.exponentialRampToValueAtTime(1e-4, time + Math.max(.18, duration));
	const output = panNode(ctx, dest, pan);
	osc.connect(o1);
	body.connect(o2);
	o1.connect(mix);
	o2.connect(mix);
	mix.connect(filter);
	filter.connect(gain);
	gain.connect(output);
	osc.start(time);
	body.start(time);
	osc.stop(time + duration + .06);
	body.stop(time + duration + .06);
	return [
		osc,
		body,
		o1,
		o2,
		mix,
		filter,
		gain,
		output,
		...tapSend(opts, output)
	];
}
function playBass(opts) {
	const { ctx, dest, time, midi, duration, velocity, timbre, intensity } = opts;
	const freq = midiToFreq(Math.max(36, midi));
	const sine = ctx.createOscillator();
	sine.type = "sine";
	sine.frequency.value = freq;
	const oct = ctx.createOscillator();
	oct.type = "triangle";
	oct.frequency.value = freq * 2;
	const third = ctx.createOscillator();
	third.type = "sine";
	third.frequency.value = freq * 3;
	const filter = ctx.createBiquadFilter();
	filter.type = "lowpass";
	filter.frequency.value = Math.max(820, timbre.bassCutoff * (1.35 + intensity * .55));
	filter.Q.value = .65;
	const mix = ctx.createGain();
	const sineG = ctx.createGain();
	sineG.gain.value = 1;
	const octG = ctx.createGain();
	octG.gain.value = .55;
	const thirdG = ctx.createGain();
	thirdG.gain.value = opts.cleanTails === false ? .22 : .1;
	const gain = ctx.createGain();
	const lvl = peak("bass", velocity);
	gain.gain.setValueAtTime(1e-4, time);
	gain.gain.exponentialRampToValueAtTime(lvl, time + .01);
	gain.gain.setTargetAtTime(lvl * .72, time + .07, .08);
	gain.gain.setTargetAtTime(1e-4, time + Math.max(.2, duration - .04), .07);
	sine.connect(sineG);
	oct.connect(octG);
	third.connect(thirdG);
	sineG.connect(mix);
	octG.connect(mix);
	thirdG.connect(mix);
	mix.connect(filter);
	filter.connect(gain);
	gain.connect(dest);
	sine.start(time);
	oct.start(time);
	third.start(time);
	sine.stop(time + duration + .08);
	oct.stop(time + duration + .08);
	third.stop(time + duration + .08);
	return [
		sine,
		oct,
		third,
		sineG,
		octG,
		thirdG,
		mix,
		filter,
		gain,
		...tapSend(opts, gain)
	];
}
function playLead(opts) {
	const { ctx, dest, time, midi, duration, velocity, timbre, intensity, pan } = opts;
	const osc = ctx.createOscillator();
	osc.type = "sawtooth";
	osc.frequency.value = midiToFreq(midi);
	osc.detune.value = -7;
	const uni = ctx.createOscillator();
	uni.type = "sawtooth";
	uni.frequency.value = midiToFreq(midi);
	uni.detune.value = 8;
	const sub = ctx.createOscillator();
	sub.type = "triangle";
	sub.frequency.value = midiToFreq(midi);
	const filter = ctx.createBiquadFilter();
	filter.type = "lowpass";
	filter.frequency.value = Math.max(1800, timbre.leadCutoff * (.85 + intensity * .6));
	filter.Q.value = .95;
	const mix = ctx.createGain();
	const g1 = ctx.createGain();
	g1.gain.value = .52;
	const g2 = ctx.createGain();
	g2.gain.value = .42;
	const g3 = ctx.createGain();
	g3.gain.value = .32;
	const gain = ctx.createGain();
	const lvl = peak("lead", velocity);
	gain.gain.setValueAtTime(1e-4, time);
	gain.gain.exponentialRampToValueAtTime(lvl, time + .012);
	gain.gain.setTargetAtTime(lvl * .7, time + .08, .1);
	gain.gain.setTargetAtTime(1e-4, time + Math.max(.18, duration - .05), .08);
	const output = panNode(ctx, dest, pan);
	osc.connect(g1);
	uni.connect(g2);
	sub.connect(g3);
	g1.connect(mix);
	g2.connect(mix);
	g3.connect(mix);
	mix.connect(filter);
	filter.connect(gain);
	gain.connect(output);
	osc.start(time);
	uni.start(time);
	sub.start(time);
	osc.stop(time + duration + .08);
	uni.stop(time + duration + .08);
	sub.stop(time + duration + .08);
	return [
		osc,
		uni,
		sub,
		g1,
		g2,
		g3,
		mix,
		filter,
		gain,
		output,
		...tapSend(opts, output)
	];
}
function playBell(opts) {
	const { ctx, dest, time, midi, duration, velocity, timbre, pan } = opts;
	const freq = midiToFreq(midi);
	const ratios = [
		1,
		2.01 + timbre.bellInharmonic,
		2.99,
		4.12 + timbre.bellInharmonic * 1.2
	];
	const weights = [
		1,
		.38,
		.18,
		.1
	];
	const mix = ctx.createGain();
	const lvl = peak("bell", velocity);
	mix.gain.setValueAtTime(1e-4, time);
	mix.gain.exponentialRampToValueAtTime(lvl, time + .004);
	mix.gain.exponentialRampToValueAtTime(1e-4, time + Math.max(opts.cleanTails === false ? .45 : .28, duration * (opts.cleanTails === false ? 1.6 : 1.12)));
	const output = panNode(ctx, dest, pan);
	mix.connect(output);
	const oscs = [...tapSend(opts, output)];
	ratios.forEach((ratio, i) => {
		const osc = ctx.createOscillator();
		osc.type = "sine";
		osc.frequency.value = freq * ratio;
		const partial = ctx.createGain();
		partial.gain.value = weights[i] ?? .08;
		osc.connect(partial);
		partial.connect(mix);
		osc.start(time);
		osc.stop(time + duration + (opts.cleanTails === false ? .35 : .2));
		oscs.push(osc, partial);
	});
	return [
		...oscs,
		mix,
		output
	];
}
function playKick(opts) {
	const { ctx, dest, time, velocity } = opts;
	const osc = ctx.createOscillator();
	osc.type = "sine";
	osc.frequency.setValueAtTime(178, time);
	osc.frequency.exponentialRampToValueAtTime(48, time + .09);
	const gain = ctx.createGain();
	const lvl = peak("kick", velocity);
	gain.gain.setValueAtTime(1e-4, time);
	gain.gain.exponentialRampToValueAtTime(lvl, time + .003);
	gain.gain.exponentialRampToValueAtTime(1e-4, time + .26);
	osc.connect(gain);
	gain.connect(dest);
	osc.start(time);
	osc.stop(time + .32);
	const click = ctx.createOscillator();
	click.type = "square";
	click.frequency.value = opts.cleanTails === false ? 640 : 1900;
	const clickGain = ctx.createGain();
	clickGain.gain.setValueAtTime(lvl * (opts.cleanTails === false ? .22 : .1), time);
	clickGain.gain.exponentialRampToValueAtTime(1e-4, time + (opts.cleanTails === false ? .022 : .012));
	click.connect(clickGain);
	clickGain.connect(dest);
	click.start(time);
	click.stop(time + .04);
	return [
		osc,
		gain,
		click,
		clickGain
	];
}
function playSnare(opts) {
	const { ctx, dest, time, velocity } = opts;
	const noise = noiseSource(ctx, time, .22);
	const hp = ctx.createBiquadFilter();
	hp.type = "highpass";
	hp.frequency.value = opts.cleanTails === false ? 850 : 1100;
	const bp = ctx.createBiquadFilter();
	bp.type = "bandpass";
	bp.frequency.value = opts.cleanTails === false ? 1800 : 2100;
	bp.Q.value = opts.cleanTails === false ? .65 : .5;
	const gain = ctx.createGain();
	const lvl = peak("snare", velocity);
	gain.gain.setValueAtTime(1e-4, time);
	gain.gain.exponentialRampToValueAtTime(lvl, time + .003);
	gain.gain.exponentialRampToValueAtTime(1e-4, time + .2);
	noise.connect(hp);
	hp.connect(bp);
	bp.connect(gain);
	gain.connect(dest);
	const body = ctx.createOscillator();
	body.type = "triangle";
	body.frequency.setValueAtTime(opts.cleanTails === false ? 220 : 180, time);
	body.frequency.exponentialRampToValueAtTime(opts.cleanTails === false ? 130 : 110, time + .06);
	const bodyGain = ctx.createGain();
	bodyGain.gain.setValueAtTime(lvl * (opts.cleanTails === false ? .42 : .18), time);
	bodyGain.gain.exponentialRampToValueAtTime(1e-4, time + (opts.cleanTails === false ? .12 : .07));
	body.connect(bodyGain);
	bodyGain.connect(dest);
	body.start(time);
	body.stop(time + .14);
	return [
		noise,
		hp,
		bp,
		gain,
		body,
		bodyGain,
		...tapSend(opts, gain)
	];
}
function playHat(opts) {
	const { ctx, dest, time, velocity, midi } = opts;
	const noise = noiseSource(ctx, time, .12);
	const hp = ctx.createBiquadFilter();
	hp.type = "highpass";
	hp.frequency.value = midi > 82 ? 7800 : opts.cleanTails === false ? 5800 : 6400;
	const gain = ctx.createGain();
	const dur = midi > 82 ? .15 : .05;
	const lvl = peak("hat", velocity);
	gain.gain.setValueAtTime(1e-4, time);
	gain.gain.exponentialRampToValueAtTime(lvl, time + .002);
	gain.gain.exponentialRampToValueAtTime(1e-4, time + dur);
	noise.connect(hp);
	hp.connect(gain);
	gain.connect(dest);
	return [
		noise,
		hp,
		gain
	];
}
function playClick(opts) {
	const { ctx, dest, time, midi, velocity, pan } = opts;
	const osc = ctx.createOscillator();
	osc.type = "sine";
	osc.frequency.value = midiToFreq(Math.max(74, midi));
	const gain = ctx.createGain();
	const lvl = peak("click", velocity);
	gain.gain.setValueAtTime(1e-4, time);
	gain.gain.exponentialRampToValueAtTime(lvl, time + .002);
	gain.gain.exponentialRampToValueAtTime(1e-4, time + .1);
	const output = panNode(ctx, dest, pan ?? .2);
	osc.connect(gain);
	gain.connect(output);
	osc.start(time);
	osc.stop(time + .12);
	return [
		osc,
		gain,
		output,
		...tapSend(opts, output)
	];
}
function playNoise(opts) {
	const { ctx, dest, time, duration, velocity, timbre } = opts;
	const noise = noiseSource(ctx, time, duration);
	const filter = ctx.createBiquadFilter();
	filter.type = "bandpass";
	filter.frequency.value = 1700;
	filter.Q.value = .4;
	const gain = ctx.createGain();
	gain.gain.value = peak("noise", velocity) * (.45 + timbre.noiseAmount);
	noise.connect(filter);
	filter.connect(gain);
	gain.connect(dest);
	return [
		noise,
		filter,
		gain,
		...tapSend(opts, gain)
	];
}
function playPickup(opts) {
	const { ctx, dest, time, midi, velocity, pan } = opts;
	const freq = midiToFreq(midi);
	const osc = ctx.createOscillator();
	osc.type = "sine";
	osc.frequency.value = freq;
	const osc2 = ctx.createOscillator();
	osc2.type = "triangle";
	osc2.frequency.value = freq * 2;
	const filter = ctx.createBiquadFilter();
	filter.type = "lowpass";
	filter.frequency.setValueAtTime(6200, time);
	filter.frequency.exponentialRampToValueAtTime(1800, time + .26);
	const gain = ctx.createGain();
	const lvl = peak("pickup", velocity);
	gain.gain.setValueAtTime(1e-4, time);
	gain.gain.exponentialRampToValueAtTime(lvl, time + .002);
	gain.gain.exponentialRampToValueAtTime(1e-4, time + .4);
	const output = panNode(ctx, dest, pan ?? 0);
	osc.connect(filter);
	osc2.connect(filter);
	filter.connect(gain);
	gain.connect(output);
	osc.start(time);
	osc2.start(time);
	osc.stop(time + .42);
	osc2.stop(time + .42);
	const noise = noiseSource(ctx, time, .04);
	const hp = ctx.createBiquadFilter();
	hp.type = "highpass";
	hp.frequency.value = 3200;
	const nGain = ctx.createGain();
	nGain.gain.setValueAtTime(lvl * (opts.cleanTails === false ? .7 : .32), time);
	nGain.gain.exponentialRampToValueAtTime(1e-4, time + .028);
	noise.connect(hp);
	hp.connect(nGain);
	nGain.connect(output);
	return [
		osc,
		osc2,
		filter,
		gain,
		output,
		noise,
		hp,
		nGain,
		...tapSend(opts, output)
	];
}
function playEvent(opts) {
	const { ctx, dest, time, midi, velocity } = opts;
	const osc = ctx.createOscillator();
	osc.type = "sawtooth";
	osc.frequency.setValueAtTime(midiToFreq(midi), time);
	osc.frequency.exponentialRampToValueAtTime(Math.max(40, midiToFreq(midi) * .55), time + .12);
	const filter = ctx.createBiquadFilter();
	filter.type = "lowpass";
	filter.frequency.value = 900;
	const gain = ctx.createGain();
	const lvl = peak("event", velocity);
	gain.gain.setValueAtTime(1e-4, time);
	gain.gain.exponentialRampToValueAtTime(lvl, time + .004);
	gain.gain.exponentialRampToValueAtTime(1e-4, time + .16);
	osc.connect(filter);
	filter.connect(gain);
	gain.connect(dest);
	osc.start(time);
	osc.stop(time + .18);
	return [
		osc,
		filter,
		gain
	];
}
var noiseCache = /* @__PURE__ */ new WeakMap();
function noiseSource(ctx, time, duration) {
	let buffer = noiseCache.get(ctx);
	if (!buffer) {
		buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * .4)), ctx.sampleRate);
		const data = buffer.getChannelData(0);
		for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
		noiseCache.set(ctx, buffer);
	}
	const src = ctx.createBufferSource();
	src.buffer = buffer;
	src.loop = true;
	src.start(time);
	src.stop(time + duration + .02);
	return src;
}
function panNode(ctx, dest, pan) {
	if (pan === void 0 || Math.abs(pan) < .02) {
		const g = ctx.createGain();
		g.connect(dest);
		return g;
	}
	const panner = ctx.createStereoPanner();
	panner.pan.value = Math.max(-.72, Math.min(.72, pan));
	panner.connect(dest);
	return panner;
}
function toDbfs(v) {
	return v <= 1e-8 ? -120 : 20 * Math.log10(v);
}
/**
* Peak / RMS always. Ungated K-weighted loudness when the buffer is 48 kHz
* (ITU-R BS.1770 pre-filter + RLB coefficients). No gating, no true-peak
* oversampling — labelled as an estimate, not LUFS-I.
*/
function measureBuffer(buffer) {
	const ch0 = buffer.getChannelData(0);
	const ch1 = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : ch0;
	const n = ch0.length;
	let peak = 0;
	let sum = 0;
	for (let i = 0; i < n; i++) {
		const l = ch0[i] ?? 0;
		const r = ch1[i] ?? 0;
		const a = Math.max(Math.abs(l), Math.abs(r));
		if (a > peak) peak = a;
		sum += l * l + r * r;
	}
	const rms = Math.sqrt(sum / (n * Math.max(1, buffer.numberOfChannels)));
	const lufsUngated = Math.abs(buffer.sampleRate - 48e3) < 1 ? kWeightedUngated(ch0, ch1) : null;
	return {
		peak,
		rms,
		peakDbfs: toDbfs(peak),
		rmsDbfs: toDbfs(rms),
		lufsUngated
	};
}
function kWeightedUngated(left, right) {
	const a = kFilter(left);
	const b = kFilter(right);
	let power = 0;
	const n = a.length;
	for (let i = 0; i < n; i++) power += ((a[i] ?? 0) ** 2 + (b[i] ?? 0) ** 2) * .5;
	const mean = power / Math.max(1, n);
	if (mean <= 1e-12) return -70;
	return -.691 + 10 * Math.log10(mean);
}
function kFilter(input) {
	return biquad(biquad(input, [
		1.53512485958697,
		-2.69169618940638,
		1.19839281085285
	], [
		1,
		-1.69065929318241,
		.73248077421585
	]), [
		1,
		-2,
		1
	], [
		1,
		-1.99004745483398,
		.99007225036621
	]);
}
function biquad(input, b, a) {
	const out = new Float32Array(input.length);
	let x1 = 0;
	let x2 = 0;
	let y1 = 0;
	let y2 = 0;
	const b0 = b[0] ?? 1;
	const b1 = b[1] ?? 0;
	const b2 = b[2] ?? 0;
	const a1 = a[1] ?? 0;
	const a2 = a[2] ?? 0;
	for (let i = 0; i < input.length; i++) {
		const x = input[i] ?? 0;
		const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
		out[i] = y;
		x2 = x1;
		x1 = x;
		y2 = y1;
		y1 = y;
	}
	return out;
}
function encodeWav(buffer) {
	const channels = buffer.numberOfChannels;
	const sampleRate = buffer.sampleRate;
	const length = buffer.length;
	const blockAlign = channels * 2;
	const dataSize = length * blockAlign;
	const headerSize = 44;
	const out = new ArrayBuffer(headerSize + dataSize);
	const view = new DataView(out);
	writeString(view, 0, "RIFF");
	view.setUint32(4, 36 + dataSize, true);
	writeString(view, 8, "WAVE");
	writeString(view, 12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, channels, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * blockAlign, true);
	view.setUint16(32, blockAlign, true);
	view.setUint16(34, 16, true);
	writeString(view, 36, "data");
	view.setUint32(40, dataSize, true);
	const interleaved = new Int16Array(out, headerSize);
	const chans = [];
	for (let c = 0; c < channels; c++) chans.push(buffer.getChannelData(c));
	let cursor = 0;
	for (let i = 0; i < length; i++) for (let c = 0; c < channels; c++) {
		const sample = Math.max(-1, Math.min(1, chans[c][i] ?? 0));
		interleaved[cursor++] = sample < 0 ? sample * 32768 : sample * 32767;
	}
	return out;
}
function writeString(view, offset, text) {
	for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
}
var OrbitaMusicEngine = class {
	config;
	ctx = null;
	mixer = null;
	transport = new Transport(80);
	voices;
	session = null;
	timer = null;
	intensity = .35;
	targetIntensity = .35;
	combo = 0;
	mode = "expedition";
	composedBars = /* @__PURE__ */ new Map();
	lastVoicing;
	pickupHistory = [];
	lastPickupTime = 0;
	pickupBurstWindow = 0;
	pickupBurstCount = 0;
	lastMusicalPickup = 0;
	transitioning = false;
	pending = null;
	disposed = false;
	lastSection = "idle";
	revision = "v1.3";
	sectionLoop = null;
	mutedLayers = /* @__PURE__ */ new Set();
	soloLayers = /* @__PURE__ */ new Set();
	constructor(config = {}) {
		this.config = {
			musicVolume: config.musicVolume ?? 1,
			sfxVolume: config.sfxVolume ?? 1,
			masterVolume: config.masterVolume ?? 1,
			maxVoices: config.maxVoices ?? 28,
			lookaheadSec: config.lookaheadSec ?? .12,
			scheduleIntervalMs: config.scheduleIntervalMs ?? 25,
			revision: config.revision ?? "v1.3"
		};
		this.revision = this.config.revision;
		this.voices = new VoiceManager(this.config.maxVoices);
	}
	async initialize() {
		if (this.ctx) return;
		const Ctor = globalThis.AudioContext || globalThis.webkitAudioContext;
		if (!Ctor) throw new Error("Web Audio API is not available");
		this.ctx = new Ctor({ latencyHint: "interactive" });
		this.mixer = createMixer(this.ctx);
		this.mixer.setMusicVolume(this.config.musicVolume);
		this.mixer.setSfxVolume(this.config.sfxVolume);
		this.mixer.setMasterVolume(this.config.masterVolume);
		if (this.ctx.state === "suspended") try {
			await this.ctx.resume();
		} catch {}
	}
	async resumeAudioContext() {
		if (!this.ctx) await this.initialize();
		if (this.ctx && this.ctx.state === "suspended") await this.ctx.resume();
	}
	startTheme(themeId, options = {}) {
		this.ensureAudio();
		this.stopInternal(false);
		this.session = createSession({
			themeId,
			seed: options.seed ?? `${themeId.toUpperCase()}-SEED`,
			variationSeed: options.variationSeed,
			profile: options.profile
		});
		this.composedBars.clear();
		this.lastVoicing = void 0;
		this.pickupHistory = [];
		this.pickupBurstCount = 0;
		this.transitioning = false;
		this.pending = null;
		this.transport.bpm = this.session.tempo;
		this.applyMix();
		this.transport.start(this.ctx.currentTime + .06);
		this.loop();
	}
	transitionToTheme(themeId, options = {}) {
		if (!this.session || !this.ctx) {
			this.startTheme(themeId, options);
			return;
		}
		const next = createSession({
			themeId,
			seed: options.seed ?? `${themeId.toUpperCase()}-SEED`,
			variationSeed: options.variationSeed,
			profile: options.profile
		});
		const currentBar = this.transport.beatTime(this.ctx.currentTime).bar;
		this.pending = {
			themeId,
			options,
			switchAtBar: currentBar + Math.max(2, options.bars ?? 2),
			session: next
		};
		this.transitioning = true;
		const avg = Math.round((this.session.tempo + next.tempo) / 2);
		this.transport.setBpm(avg, this.ctx.currentTime);
		this.mixer?.prepareHarmonicChange(this.ctx.currentTime, .45);
	}
	transitionToPlanet(profile, options = {}) {
		this.transitionToTheme("procedural", {
			...options,
			profile,
			seed: profile.seed
		});
	}
	setIntensity(value) {
		this.targetIntensity = clamp01(value);
	}
	setCombo(combo) {
		this.combo = Math.max(0, Math.min(999, Math.round(combo)));
	}
	setGameMode(mode) {
		this.mode = mode;
		if (mode === "calm") this.targetIntensity = Math.min(this.targetIntensity, .28);
	}
	triggerLightPickup(options = {}) {
		if (!this.session || !this.ctx || !this.mixer) return;
		const now = this.ctx.currentTime;
		const beat = this.transport.beatTime(now);
		const voicing = this.currentScore()?.chord ?? this.lastVoicing;
		if (!voicing) return;
		if (now - this.pickupBurstWindow > .35) this.pickupBurstCount = 0;
		this.pickupBurstWindow = now;
		this.pickupBurstCount += 1;
		this.lastPickupTime = now;
		const clickMidi = Math.min(96, 84 + this.pickupBurstCount % 3);
		this.playAt("click", clickMidi, .07, .42, now, .2, this.mixer.sfx, 10);
		if (!(this.pickupBurstCount <= 2 || now - this.lastMusicalPickup > .22)) return;
		if (!this.layerAudible("gameplay")) return;
		const rng = createPrng(`${this.session.variationSeed}::pickup:${this.pickupHistory.length}:${now.toFixed(3)}`);
		const strong = beat.fractionalBeat % 1 < .12 || Math.abs(beat.fractionalBeat % 1 - .5) < .08;
		const policy = tensionPolicyFor(this.session.themeId, this.session.scale, {
			anomaly: this.mode === "anomaly",
			tension: this.session.dna.tension
		});
		const midi = choosePickupMidi({
			voicing,
			tonicPc: this.session.tonicPc,
			scale: this.session.scale,
			combo: this.combo,
			strongBeat: strong,
			rng,
			policy
		});
		if (!validatePickup(midi, voicing, this.session.tonicPc, this.session.scale)) return;
		const velocity = clamp01(options.velocity ?? .9 + Math.min(.1, this.combo * .008));
		this.playAt("pickup", midi, .32, velocity, now, void 0, void 0, 10);
		this.pickupHistory.push(midi);
		if (this.pickupHistory.length > 12) this.pickupHistory.shift();
		this.lastMusicalPickup = now;
		if (this.combo >= 14 && this.pickupBurstCount <= 1 && rng.chance(.55)) {
			const second = choosePickupHarmony(midi, voicing, this.session.tonicPc, this.session.scale, policy, rng);
			if (second !== null) this.playAt("pickup", second, .24, velocity * .62, now + .07, void 0, void 0, 10);
		}
	}
	triggerOrbitIn() {
		this.orbitAccent(-5);
	}
	triggerOrbitOut() {
		this.orbitAccent(7);
	}
	triggerShieldHit() {
		if (!this.session || !this.mixer || !this.ctx) return;
		const midi = (this.lastVoicing?.rootMidi ?? 60) + 12;
		this.playAt("click", midi, .12, .5, this.ctx.currentTime, void 0, this.mixer.sfx);
	}
	triggerDamage() {
		if (!this.session || !this.mixer || !this.ctx) return;
		const root = this.lastVoicing?.rootMidi ?? 48;
		const now = this.ctx.currentTime;
		this.playAt("event", root + 1, .14, .58, now);
		this.playAt("event", root + 6, .1, .38, now + .04);
	}
	triggerRunEnd() {
		if (!this.session || !this.mixer || !this.ctx) return;
		const tonic = 60 + this.session.tonicPc;
		const now = this.ctx.currentTime;
		this.playAt("pad", tonic, 1.6, .55, now);
		this.playAt("bell", tonic + 7, .8, .5, now + .18);
		this.playAt("bell", tonic + 12, 1.1, .45, now + .45);
	}
	setMusicVolume(value) {
		this.config.musicVolume = clamp01(value);
		this.mixer?.setMusicVolume(this.config.musicVolume);
	}
	setSfxVolume(value) {
		this.config.sfxVolume = clamp01(value);
		this.mixer?.setSfxVolume(this.config.sfxVolume);
	}
	setMasterVolume(value) {
		this.config.masterVolume = clamp01(value);
		this.mixer?.setMasterVolume(this.config.masterVolume);
	}
	setSpeakerPreview(on) {
		this.mixer?.setSpeakerPreview(on);
	}
	setRevision(revision) {
		this.revision = revision;
		this.config.revision = revision;
		this.applyMix();
	}
	setMuted(music, sfx) {
		this.mixer?.setMusicMuted(music);
		this.mixer?.setSfxMuted(sfx);
	}
	setLayerMute(layer, muted) {
		if (muted) this.mutedLayers.add(layer);
		else this.mutedLayers.delete(layer);
	}
	setLayerSolo(layer, solo) {
		if (solo) this.soloLayers.add(layer);
		else this.soloLayers.delete(layer);
	}
	clearLayerFocus() {
		this.mutedLayers.clear();
		this.soloLayers.clear();
	}
	setSectionLoop(section) {
		this.sectionLoop = section;
		this.composedBars.clear();
	}
	restartPhrase() {
		if (!this.session || !this.ctx) return;
		const bar = this.transport.beatTime(this.ctx.currentTime).bar;
		const window = phraseWindow(this.session, bar, this.sectionLoop ?? void 0);
		this.composedBars.clear();
		this.lastVoicing = void 0;
		this.transport.seekToBar(window.startBar, this.ctx.currentTime);
	}
	nextPhrase() {
		if (!this.session || !this.ctx) return;
		const bar = this.transport.beatTime(this.ctx.currentTime).bar;
		const start = nextPhraseStart(this.session, bar);
		this.composedBars.clear();
		this.lastVoicing = void 0;
		this.transport.seekToBar(start, this.ctx.currentTime);
	}
	pause() {
		if (!this.ctx) return;
		this.transport.pause(this.ctx.currentTime);
	}
	resume() {
		if (!this.ctx) return;
		this.resumeAudioContext();
		this.transport.resume(this.ctx.currentTime);
		this.loop();
	}
	stop() {
		this.stopInternal(true);
	}
	dispose() {
		this.stopInternal(true);
		this.mixer?.dispose();
		this.mixer = null;
		if (this.ctx) {
			this.ctx.close();
			this.ctx = null;
		}
		this.disposed = true;
	}
	getDiagnostics() {
		const beat = this.ctx ? this.transport.beatTime(this.ctx.currentTime) : {
			bar: 0,
			beat: 0
		};
		const meter = this.mixer?.readMeter();
		const score = this.currentScore();
		return {
			activeVoices: this.voices.activeVoices,
			scheduledEvents: this.voices.scheduledEvents,
			bpm: this.session?.tempo ?? this.transport.bpm,
			currentBar: beat.bar,
			currentBeat: Number(beat.beat.toFixed(3)),
			beatsPerBar: 4,
			subdivision: 4,
			section: score?.section ?? this.lastSection,
			theme: this.session?.themeId ?? "idle",
			intensity: this.intensity,
			combo: this.combo,
			mode: this.mode,
			seed: this.session?.seed ?? "",
			scale: this.session?.scale ?? "none",
			keyName: this.session ? pcName(this.session.tonicPc) : "-",
			running: this.transport.running,
			paused: this.transport.paused,
			suspended: this.ctx?.state === "suspended",
			masterVolume: this.mixer?.masterVolume ?? this.config.masterVolume,
			musicVolume: this.mixer?.musicVolume ?? this.config.musicVolume,
			sfxVolume: this.mixer?.sfxVolume ?? this.config.sfxVolume,
			peak: meter?.peak ?? 0,
			rms: meter?.rms ?? 0,
			peakDbfs: meter?.peakDbfs ?? -120,
			rmsDbfs: meter?.rmsDbfs ?? -120,
			limiterReduction: meter?.reduction ?? 0,
			compressorReduction: meter?.compressorReduction ?? 0,
			speakerPreview: this.mixer?.speakerPreview ?? false,
			revision: this.revision,
			phrase: score?.phrase,
			sectionLoop: this.sectionLoop,
			mutedLayers: [...this.mutedLayers],
			soloLayers: [...this.soloLayers]
		};
	}
	exportCompositionPlan() {
		if (!this.session) return null;
		return exportPlan(this.session);
	}
	getAnalyser() {
		return this.mixer?.analyser ?? null;
	}
	getCurrentHarmony() {
		const score = this.currentScore();
		return {
			midiAllowed: score?.chord.midi ?? [],
			chord: score?.chord,
			scale: this.session?.scale ?? "none"
		};
	}
	async renderOffline(seconds) {
		return encodeWav(await this.renderToBuffer(seconds));
	}
	async measureOffline(seconds) {
		return measureBuffer(await this.renderToBuffer(seconds));
	}
	async renderToBuffer(seconds) {
		if (!this.session) throw new Error("Start a theme before rendering");
		const duration = Math.max(4, Math.min(90, seconds));
		const sampleRate = 48e3;
		const offline = new OfflineAudioContext(2, Math.floor(sampleRate * duration), sampleRate);
		const mixer = createMixer(offline);
		mixer.setMusicVolume(this.config.musicVolume);
		mixer.setSfxVolume(this.config.sfxVolume);
		mixer.setMasterVolume(this.config.masterVolume);
		if (this.session.themeId === "procedural") mixer.setMixProfile(mixProfileFromDna(this.session.dna, this.revision));
		else mixer.setThemeMix(this.session.themeId, this.revision);
		const session = this.session;
		const spb = 60 / session.tempo;
		const bars = Math.ceil(duration / (spb * 4));
		let prev;
		const localVoices = new VoiceManager(this.config.maxVoices);
		for (let bar = 0; bar < bars; bar++) {
			const score = composeBar({
				session,
				barIndex: bar,
				intensity: this.intensity,
				combo: this.combo,
				mode: this.mode,
				previousVoicing: prev,
				pickupContour: this.pickupHistory,
				polish: this.revision !== "v1.1",
				composer: this.revision === "v1.3"
			});
			prev = score.chord;
			for (const note of score.notes) {
				if (!this.layerAudible(note.layer ?? "atmosphere")) continue;
				const time = bar * 4 * spb + note.tick / 4 * spb;
				if (time >= duration) continue;
				const dur = note.durationTicks / 4 * spb;
				const nodes = playVoice(note.voice, {
					ctx: offline,
					dest: mixer.busFor(note.voice),
					time,
					midi: note.midi,
					duration: dur,
					velocity: note.velocity,
					pan: note.pan,
					timbre: session.theme.timbre,
					intensity: this.intensity,
					send: mixer.space.input,
					sendGain: mixer.sendAmount(note.voice) * (score.phrase ? spaceSend(score.phrase.section) : 1),
					cleanTails: this.revision !== "v1.1"
				});
				localVoices.track(nodes, time + dur + .3, note.priority ?? voicePriority(note.voice));
			}
		}
		const rendered = await offline.startRendering();
		localVoices.dispose();
		mixer.dispose();
		return rendered;
	}
	applyMix() {
		if (!this.mixer || !this.session) return;
		if (this.session.themeId === "procedural") this.mixer.setMixProfile(mixProfileFromDna(this.session.dna, this.revision));
		else this.mixer.setThemeMix(this.session.themeId, this.revision);
	}
	loop = () => {
		if (this.disposed || !this.ctx || !this.session || !this.mixer) return;
		if (!this.transport.running || this.transport.paused) return;
		this.voices.sweep(this.ctx.currentTime);
		this.intensity += (this.targetIntensity - this.intensity) * .08;
		this.scheduleAhead();
		this.timer = setTimeout(this.loop, this.config.scheduleIntervalMs);
	};
	scheduleAhead() {
		const ctx = this.ctx;
		const lookahead = this.config.lookaheadSec;
		const now = ctx.currentTime;
		const spb = this.transport.secondsPerBeat();
		const startBeats = this.transport.elapsedBeats(now);
		const endBeats = this.transport.elapsedBeats(now + lookahead + .08);
		const startBar = Math.max(0, Math.floor(startBeats / 4));
		const endBar = Math.floor(endBeats / 4) + 1;
		for (let bar = startBar; bar <= endBar; bar++) {
			if (this.composedBars.has(bar)) continue;
			if (this.pending && bar >= this.pending.switchAtBar) this.advanceTransition(bar);
			const forceSection = this.sectionLoop ?? (this.transitioning && this.pending && bar < this.pending.switchAtBar ? "TRANSITION" : void 0);
			const composeIndex = this.sectionLoop ? bar % SECTION_BARS[this.sectionLoop] : bar;
			const incomingVoicing = forceSection === "TRANSITION" && this.pending ? chordAtBar(this.pending.session, "A", 0, this.lastVoicing?.midi) : void 0;
			const previousPcs = this.lastVoicing?.pitchClasses.join(",");
			const score = composeBar({
				session: this.session,
				barIndex: composeIndex,
				intensity: this.mode === "calm" ? Math.min(this.intensity, .3) : this.intensity,
				combo: this.combo,
				mode: this.mode,
				previousVoicing: this.lastVoicing,
				pickupContour: this.pickupHistory,
				forceSection,
				incomingVoicing,
				polish: this.revision !== "v1.1",
				composer: this.revision === "v1.3"
			});
			this.composedBars.set(bar, score);
			if (this.revision !== "v1.1" && previousPcs && previousPcs !== score.chord.pitchClasses.join(",")) {
				const barStart = this.transport.timeOfTick(bar, 0);
				this.mixer?.prepareHarmonicChange(barStart, .22);
			}
			if (this.revision === "v1.3" && score.phrase) this.mixer?.space.setWetScale(score.phrase ? spaceSend(score.section) : 1, this.transport.timeOfTick(bar, 0));
			this.lastVoicing = score.chord;
			this.lastSection = score.section;
			const barStart = this.transport.timeOfTick(bar, 0);
			for (const note of score.notes) {
				if (!this.layerAudible(note.layer ?? "atmosphere")) continue;
				const time = barStart + note.tick / 4 * spb;
				if (time < now - .02) continue;
				const dur = note.durationTicks / 4 * spb;
				this.playAt(note.voice, note.midi, dur, note.velocity, time, note.pan, void 0, note.priority);
			}
		}
		if (this.composedBars.size > 64) {
			const minKeep = startBar - 4;
			for (const key of this.composedBars.keys()) if (key < minKeep) this.composedBars.delete(key);
		}
	}
	layerAudible(layer) {
		if (this.soloLayers.size > 0) return this.soloLayers.has(layer);
		return !this.mutedLayers.has(layer);
	}
	advanceTransition(_bar) {
		if (!this.pending || !this.session) return;
		const next = this.pending.session;
		this.pending = null;
		this.transitioning = false;
		this.session = next;
		if (this.ctx) {
			this.transport.setBpm(this.session.tempo, this.ctx.currentTime);
			this.mixer?.prepareHarmonicChange(this.ctx.currentTime, .4);
		}
		this.applyMix();
	}
	currentScore() {
		if (!this.ctx) return void 0;
		const bar = this.transport.beatTime(this.ctx.currentTime).bar;
		return this.composedBars.get(bar);
	}
	orbitAccent(offset) {
		if (!this.session || !this.mixer || !this.ctx) return;
		if (!this.layerAudible("gameplay")) return;
		let midi = (this.lastVoicing?.rootMidi ?? 72) + offset;
		if (!isInScale(midi, this.session.tonicPc, this.session.scale) && this.lastVoicing && !isChordTone(midi, this.lastVoicing)) midi = nearestScaleMidi(midi, this.session.tonicPc, this.session.scale);
		this.playAt("bell", midi, .2, .46, this.ctx.currentTime, .15, this.mixer.sfx, 9);
	}
	playAt(voice, midi, duration, velocity, time, pan, destOverride, priority) {
		if (!this.ctx || !this.session || !this.mixer) return;
		const freq = midiToFreq(midi);
		if (!Number.isFinite(freq) || freq < 20 || freq > 8e3) return;
		const dest = destOverride ?? this.mixer.busFor(voice);
		const nodes = playVoice(voice, {
			ctx: this.ctx,
			dest,
			time,
			midi,
			duration,
			velocity: clamp01(velocity),
			pan,
			timbre: this.session.theme.timbre,
			intensity: this.intensity,
			send: this.mixer.space.input,
			sendGain: this.mixer.sendAmount(voice),
			cleanTails: this.revision !== "v1.1"
		});
		this.voices.track(nodes, time + duration + (this.revision === "v1.1" ? .4 : .22), priority ?? voicePriority(voice));
	}
	stopInternal(resetTransport) {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		this.voices.dispose();
		this.composedBars.clear();
		if (resetTransport) this.transport.stop();
	}
	ensureAudio() {
		if (this.disposed) throw new Error("Engine disposed");
		if (!this.ctx || !this.mixer) throw new Error("Call initialize() before starting audio");
	}
};
function voicePriority(voice) {
	if (voice === "pickup") return 10;
	if (voice === "event") return 9;
	if (voice === "lead") return 8;
	if (voice === "bass") return 7;
	if (voice === "kick" || voice === "pluck") return 6;
	if (voice === "pad") return 5;
	if (voice === "bell" || voice === "snare") return 4;
	return 2;
}
function spaceSend(section) {
	if (section === "INTRO") return 1.25;
	if (section === "BUILD") return 1.18;
	if (section === "PEAK") return .82;
	if (section === "RECOVERY") return 1.32;
	if (section === "TRANSITION") return 1.2;
	return 1;
}
var WORLDS = [
	{
		id: "menta",
		label: "Menta",
		hint: "Discovery"
	},
	{
		id: "durazno",
		label: "Durazno",
		hint: "Playful"
	},
	{
		id: "lavanda",
		label: "Lavanda",
		hint: "Dreamlike"
	},
	{
		id: "glaciar",
		label: "Glaciar",
		hint: "Crystal"
	},
	{
		id: "eclipse",
		label: "Eclipse",
		hint: "Final"
	},
	{
		id: "procedural",
		label: "Planet",
		hint: "Generated"
	}
];
var CAMPAIGN = [
	"menta",
	"durazno",
	"lavanda",
	"glaciar",
	"eclipse"
];
var MODES = [
	{
		id: "expedition",
		label: "Expedition"
	},
	{
		id: "calm",
		label: "Calm"
	},
	{
		id: "daily",
		label: "Daily"
	},
	{
		id: "infinite",
		label: "Infinite"
	},
	{
		id: "anomaly",
		label: "Anomaly"
	}
];
var WORLD_CLASS = {
	menta: "data-[on=true]:border-world-menta",
	durazno: "data-[on=true]:border-world-durazno",
	lavanda: "data-[on=true]:border-world-lavanda",
	glaciar: "data-[on=true]:border-world-glaciar",
	eclipse: "data-[on=true]:border-world-eclipse",
	procedural: "data-[on=true]:border-accent"
};
var idleDiagnostics = {
	activeVoices: 0,
	scheduledEvents: 0,
	bpm: 0,
	currentBar: 0,
	currentBeat: 0,
	beatsPerBar: 4,
	subdivision: 4,
	section: "idle",
	theme: "idle",
	intensity: .35,
	combo: 0,
	mode: "expedition",
	seed: "",
	scale: "none",
	keyName: "-",
	running: false,
	paused: false,
	suspended: false,
	masterVolume: 1,
	musicVolume: 1,
	sfxVolume: 1,
	peak: 0,
	rms: 0,
	peakDbfs: -120,
	rmsDbfs: -120,
	limiterReduction: 0,
	compressorReduction: 0,
	speakerPreview: false,
	revision: "v1.3",
	sectionLoop: null,
	mutedLayers: [],
	soloLayers: []
};
var SHOWCASE_MS = 36e3;
function MusicLab() {
	const engineRef = (0, import_react.useRef)(null);
	const abTimer = (0, import_react.useRef)(null);
	const showcaseTimer = (0, import_react.useRef)(null);
	const showcaseIndex = (0, import_react.useRef)(0);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [theme, setTheme] = (0, import_react.useState)("menta");
	const [seed, setSeed] = (0, import_react.useState)("MENTA-2026-001");
	const [intensity, setIntensity] = (0, import_react.useState)(50);
	const [combo, setCombo] = (0, import_react.useState)(0);
	const [mode, setMode] = (0, import_react.useState)("expedition");
	const [masterVol, setMasterVol] = (0, import_react.useState)(100);
	const [musicVol, setMusicVol] = (0, import_react.useState)(100);
	const [sfxVol, setSfxVol] = (0, import_react.useState)(100);
	const [muted, setMuted] = (0, import_react.useState)({
		music: false,
		sfx: false
	});
	const [speaker, setSpeaker] = (0, import_react.useState)(false);
	const [diag, setDiag] = (0, import_react.useState)(idleDiagnostics);
	const [analyser, setAnalyser] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)("Tap play to open the lab.");
	const [labMode, setLabMode] = (0, import_react.useState)("free");
	const [biome, setBiome] = (0, import_react.useState)("crystal");
	const [mood, setMood] = (0, import_react.useState)("mysterious");
	const [danger, setDanger] = (0, import_react.useState)(25);
	const [luminosity, setLuminosity] = (0, import_react.useState)(60);
	const [anomaly, setAnomaly] = (0, import_react.useState)(30);
	const [error, setError] = (0, import_react.useState)(null);
	const [revision, setRevision] = (0, import_react.useState)("v1.3");
	const profile = (0, import_react.useMemo)(() => ({
		seed,
		biome,
		mood,
		intensity: intensity / 100,
		temperature: biome === "lava" ? .9 : biome === "glacial" ? .1 : .5,
		luminosity: luminosity / 100,
		danger: danger / 100,
		anomaly: anomaly / 100
	}), [
		seed,
		biome,
		mood,
		intensity,
		luminosity,
		danger,
		anomaly
	]);
	const clearTimers = (0, import_react.useCallback)(() => {
		if (abTimer.current) {
			window.clearTimeout(abTimer.current);
			abTimer.current = null;
		}
		if (showcaseTimer.current) {
			window.clearTimeout(showcaseTimer.current);
			showcaseTimer.current = null;
		}
	}, []);
	(0, import_react.useEffect)(() => {
		const engine = new OrbitaMusicEngine({
			musicVolume: 1,
			sfxVolume: 1,
			masterVolume: 1
		});
		engineRef.current = engine;
		const id = window.setInterval(() => {
			setDiag(engine.getDiagnostics());
		}, 120);
		return () => {
			window.clearInterval(id);
			clearTimers();
			engine.dispose();
			engineRef.current = null;
		};
	}, [clearTimers]);
	const ensure = (0, import_react.useCallback)(async () => {
		const engine = engineRef.current;
		if (!engine) return null;
		await engine.initialize();
		await engine.resumeAudioContext();
		engine.setMasterVolume(masterVol / 100);
		engine.setMusicVolume(musicVol / 100);
		engine.setSfxVolume(sfxVol / 100);
		engine.setSpeakerPreview(speaker);
		setAnalyser(engine.getAnalyser());
		setReady(true);
		return engine;
	}, [
		masterVol,
		musicVol,
		sfxVol,
		speaker
	]);
	const startThemeNow = (0, import_react.useCallback)(async (id, nextIntensity = intensity, nextSeed = seed) => {
		const engine = await ensure();
		if (!engine) return;
		engine.setRevision(revision);
		engine.setIntensity(nextIntensity / 100);
		engine.setCombo(combo);
		engine.setGameMode(mode);
		if (id === "procedural") engine.startTheme("procedural", {
			seed: nextSeed,
			profile
		});
		else engine.startTheme(id, { seed: nextSeed });
	}, [
		combo,
		ensure,
		intensity,
		mode,
		profile,
		seed,
		revision
	]);
	const start = (0, import_react.useCallback)(async () => {
		try {
			setError(null);
			clearTimers();
			setLabMode("free");
			await startThemeNow(theme);
			setStatus("Playing");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Audio failed to start");
		}
	}, [
		clearTimers,
		startThemeNow,
		theme
	]);
	const applyRevision = async (id) => {
		setRevision(id);
		const engine = engineRef.current;
		if (!engine) return;
		engine.setRevision(id);
		if (ready && (diag.running || diag.paused)) {
			engine.setIntensity(intensity / 100);
			engine.setCombo(combo);
			engine.setGameMode(mode);
			if (theme === "procedural") engine.startTheme("procedural", {
				seed,
				profile
			});
			else engine.startTheme(theme, { seed });
			setStatus(`Playing · ${id}`);
		}
	};
	const stressListen = async () => {
		try {
			setError(null);
			clearTimers();
			setLabMode("free");
			setIntensity(92);
			setCombo(24);
			const engine = await ensure();
			if (!engine) return;
			engine.setRevision(revision);
			engine.setIntensity(.92);
			engine.setCombo(24);
			engine.setGameMode("expedition");
			if (theme === "procedural") engine.startTheme("procedural", {
				seed,
				profile
			});
			else engine.startTheme(theme, { seed });
			setStatus("Stress · high intensity + combo + pickups");
			let n = 0;
			const burst = window.setInterval(() => {
				engine.triggerLightPickup();
				n += 1;
				if (n >= 10) window.clearInterval(burst);
			}, 180);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Stress failed");
		}
	};
	const onWorld = async (id) => {
		setTheme(id);
		const engine = engineRef.current;
		if (!engine || !ready) return;
		if (labMode === "showcase") return;
		if (id === "procedural") engine.transitionToPlanet(profile);
		else engine.transitionToTheme(id, { seed });
	};
	const playAb = async (id) => {
		try {
			setError(null);
			clearTimers();
			setLabMode("ab");
			setTheme(id);
			setIntensity(50);
			setCombo(0);
			setMode("expedition");
			const engine = await ensure();
			if (!engine) return;
			engine.setIntensity(.5);
			engine.setCombo(0);
			engine.setGameMode("expedition");
			engine.startTheme(id, { seed: `AB-${id}` });
			setStatus(`A/B · ${labelFor(id)} at 50%`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "A/B failed");
		}
	};
	const play30s = async () => {
		await playAb(theme === "procedural" ? "menta" : theme);
		abTimer.current = window.setTimeout(() => {
			engineRef.current?.stop();
			setStatus("A/B 30s complete");
			setLabMode("free");
		}, 3e4);
	};
	const startShowcase = async () => {
		try {
			setError(null);
			clearTimers();
			setLabMode("showcase");
			setIntensity(55);
			setCombo(0);
			setMode("expedition");
			const engine = await ensure();
			if (!engine) return;
			engine.setIntensity(.55);
			engine.setCombo(0);
			engine.setGameMode("expedition");
			showcaseIndex.current = 0;
			const step = (index) => {
				if (index >= CAMPAIGN.length) {
					engine.stop();
					setLabMode("free");
					setStatus("Campaign showcase complete");
					return;
				}
				const id = CAMPAIGN[index];
				setTheme(id);
				if (index === 0) engine.startTheme(id, { seed: `SHOW-${id}` });
				else engine.transitionToTheme(id, {
					seed: `SHOW-${id}`,
					bars: 2
				});
				setStatus(`Showcase · ${labelFor(id)} (${index + 1}/5)`);
				showcaseTimer.current = window.setTimeout(() => step(index + 1), SHOWCASE_MS);
			};
			step(0);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Showcase failed");
		}
	};
	(0, import_react.useEffect)(() => {
		engineRef.current?.setIntensity(intensity / 100);
	}, [intensity]);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setCombo(combo);
	}, [combo]);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setGameMode(mode);
	}, [mode]);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setMusicVolume(musicVol / 100);
	}, [musicVol]);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setSfxVolume(sfxVol / 100);
	}, [sfxVol]);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setMasterVolume(masterVol / 100);
	}, [masterVol]);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setSpeakerPreview(speaker);
	}, [speaker]);
	const exportJson = () => {
		const plan = engineRef.current?.exportCompositionPlan();
		if (!plan) return;
		downloadBlob(new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" }), `orbita-${theme}-${seed}.json`);
	};
	const exportWav = async (seconds) => {
		const engine = engineRef.current;
		if (!engine || !ready) return;
		setStatus(`Rendering ${seconds}s…`);
		try {
			const wav = await engine.renderOffline(seconds);
			downloadBlob(new Blob([new Uint8Array(wav)], { type: "audio/wav" }), `orbita-${theme}-${seconds}s.wav`);
			setStatus("Playing");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Render failed");
			setStatus("Playing");
		}
	};
	const measureLoudness = async () => {
		const engine = engineRef.current;
		if (!engine || !ready) return;
		setStatus("Measuring 8s…");
		try {
			const report = await engine.measureOffline(8);
			const lufs = report.lufsUngated === null ? "n/a" : `${report.lufsUngated.toFixed(1)} LUFS*`;
			setStatus(`Peak ${report.peakDbfs.toFixed(1)} dB · RMS ${report.rmsDbfs.toFixed(1)} dB · ${lufs}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Measure failed");
		}
	};
	const peakLabel = Number.isFinite(diag.peakDbfs) ? `${diag.peakDbfs.toFixed(1)} dB` : "—";
	const rmsLabel = Number.isFinite(diag.rmsDbfs) ? `${diag.rmsDbfs.toFixed(1)} dB` : "—";
	const redLabel = `${Math.min(0, diag.limiterReduction).toFixed(1)} dB`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 pb-16 sm:px-6 lg:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.22em] text-muted uppercase",
							children: "Órbita · v1.3 composer pass"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-1 font-display text-4xl font-medium tracking-tight text-fg sm:text-5xl",
							children: "Music Lab"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-xl text-sm leading-relaxed text-muted",
							children: "Original procedural soundtrack. v1.3 writes phrases: layers share a plan, motifs repeat before they transform, and each world keeps a curated backbone."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "primary",
								onClick: () => void start(),
								className: "min-w-24",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 translate-x-px" }), "Play"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => {
									engineRef.current?.pause();
									setStatus("Paused");
								},
								"aria-label": "Pause",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => {
									clearTimers();
									setLabMode("free");
									engineRef.current?.stop();
									setStatus("Stopped");
									setDiag(engineRef.current?.getDiagnostics() ?? idleDiagnostics);
								},
								"aria-label": "Stop",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-3.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => {
									const next = {
										...muted,
										music: !muted.music
									};
									setMuted(next);
									engineRef.current?.setMuted(next.music, next.sfx);
								},
								"aria-label": "Mute music",
								children: muted.music ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
							})
						]
					})]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-md bg-surface px-3 py-2 text-sm text-danger shadow-border",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "overflow-hidden rounded-xl bg-bg-elevated shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative h-56 sm:h-72 lg:h-80",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrbitVisualizer, {
								analyser,
								diagnostics: diag,
								theme: diag.theme
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-xl text-fg",
									children: labelFor(theme)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [
										diag.keyName,
										" ",
										diag.scale,
										" · ",
										status
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
									peak: diag.peak,
									running: diag.running && !diag.paused
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid grid-cols-3 gap-px bg-border sm:grid-cols-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "BPM",
									value: diag.bpm ? diag.bpm.toFixed(0) : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Bar",
									value: String(diag.currentBar)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Section",
									value: diag.section
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Voices",
									value: String(diag.activeVoices)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Peak",
									value: peakLabel
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "RMS",
									value: rmsLabel
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid grid-cols-3 gap-px bg-border sm:grid-cols-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Master",
									value: `${Math.round(diag.masterVolume * 100)}%`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Music",
									value: `${Math.round(diag.musicVolume * 100)}%`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Events",
									value: `${Math.round(diag.sfxVolume * 100)}%`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Comp",
									value: `${Math.min(0, diag.compressorReduction).toFixed(1)} dB`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Limiter",
									value: redLabel
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Theme",
									value: String(diag.theme)
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "World" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6",
					children: WORLDS.map((world) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"data-on": theme === world.id,
						onClick: () => void onWorld(world.id),
						className: cn("min-h-11 rounded-md bg-surface px-3 py-2 text-left shadow-border transition-[background-color,border-color] duration-150", "border border-transparent hover:bg-surface-2", WORLD_CLASS[world.id], theme === world.id && "border-current bg-surface-2"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-medium",
							children: world.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs text-muted",
							children: world.hint
						})]
					}, world.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg bg-surface p-4 shadow-border sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Listening tests" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "A/B starts every world at the same 50% intensity. Showcase plays the five campaign planets in order, ~36s each. Switch engine revision to hear v1.1 mix, v1.2 polish, and v1.3 composition on the same identity."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [
								"v1.3",
								"v1.2",
								"v1.1"
							].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: revision === id ? "primary" : "secondary",
								onClick: () => void applyRevision(id),
								children: id
							}, id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: CAMPAIGN.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: labMode === "ab" && theme === id ? "primary" : "secondary",
								onClick: () => void playAb(id),
								children: labelFor(id)
							}, id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: () => void play30s(),
									children: "Play 30 sec comparison"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "primary",
									onClick: () => void startShowcase(),
									children: "Campaign showcase"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: () => void stressListen(),
									children: "Stress mix"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: speaker ? "primary" : "secondary",
									onClick: () => setSpeaker((v) => !v),
									children: speaker ? "Speaker preview on" : "Phone speaker preview"
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComposerDebug, {
					diag,
					onSolo: (layer, on) => engineRef.current?.setLayerSolo(layer, on),
					onMute: (layer, on) => engineRef.current?.setLayerMute(layer, on),
					onClear: () => engineRef.current?.clearLayerFocus(),
					onLoop: (section) => engineRef.current?.setSectionLoop(section),
					onRestart: () => engineRef.current?.restartPhrase(),
					onNext: () => engineRef.current?.nextPhrase()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 lg:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-lg bg-surface p-4 shadow-border sm:p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Intensity" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRow, {
								value: intensity,
								onChange: setIntensity,
								display: `${intensity}%`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Combo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRow, {
									value: combo,
									max: 40,
									onChange: setCombo,
									display: String(combo)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Mode" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex flex-wrap gap-2",
									children: MODES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setMode(item.id),
										className: cn("min-h-11 rounded-sm px-3 text-sm shadow-border", mode === item.id ? "bg-accent text-accent-fg" : "bg-surface-2 text-fg"),
										children: item.label
									}, item.id))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 grid gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Master output" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRow, {
									value: masterVol,
									onChange: setMasterVol,
									display: `${masterVol}%`
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Music" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRow, {
										value: musicVol,
										onChange: setMusicVol,
										display: `${musicVol}%`
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Events" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRow, {
										value: sfxVol,
										onChange: setSfxVol,
										display: `${sfxVol}%`
									})] })]
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-lg bg-surface p-4 shadow-border sm:p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Events" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventBtn, {
										label: "Collect light",
										onClick: () => engineRef.current?.triggerLightPickup()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventBtn, {
										label: "Orbit in",
										onClick: () => engineRef.current?.triggerOrbitIn()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventBtn, {
										label: "Orbit out",
										onClick: () => engineRef.current?.triggerOrbitOut()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventBtn, {
										label: "Shield hit",
										onClick: () => engineRef.current?.triggerShieldHit()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventBtn, {
										label: "Damage",
										onClick: () => engineRef.current?.triggerDamage()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventBtn, {
										label: "Run end",
										onClick: () => engineRef.current?.triggerRunEnd()
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "seed",
									children: "Seed"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "seed",
									value: seed,
									onChange: (e) => setSeed(e.target.value),
									className: "mt-2 h-11 w-full rounded-sm bg-bg px-3 font-mono text-sm text-fg shadow-border outline-none focus:ring-2 focus:ring-accent/40",
									suppressHydrationWarning: true
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										onClick: exportJson,
										size: "sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), "Plan JSON"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										onClick: () => void exportWav(30),
										size: "sm",
										children: "Render 30s"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										onClick: () => void exportWav(60),
										size: "sm",
										children: "Render 60s"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										onClick: () => void measureLoudness(),
										size: "sm",
										children: "Measure 8s"
									})
								]
							})
						]
					})]
				}),
				theme === "procedural" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-lg bg-surface p-4 shadow-border sm:p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Procedural planet" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Biome",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: biome,
									onChange: (e) => setBiome(e.target.value),
									className: "h-11 w-full rounded-sm bg-bg px-3 text-sm shadow-border",
									children: BIOMES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: item,
										children: item
									}, item))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Mood",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: mood,
									onChange: (e) => setMood(e.target.value),
									className: "h-11 w-full rounded-sm bg-bg px-3 text-sm shadow-border",
									children: MOODS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: item,
										children: optionLabel(item)
									}, item))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: `Danger ${danger}%`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: 0,
									max: 100,
									value: danger,
									onChange: (e) => setDanger(Number(e.target.value)),
									className: "w-full accent-accent"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: `Luminosity ${luminosity}%`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: 0,
									max: 100,
									value: luminosity,
									onChange: (e) => setLuminosity(Number(e.target.value)),
									className: "w-full accent-accent"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: `Anomaly ${anomaly}%`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: 0,
									max: 100,
									value: anomaly,
									onChange: (e) => setAnomaly(Number(e.target.value)),
									className: "w-full accent-accent"
								})
							})
						]
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-xs text-subtle",
					children: "All music is generated from original grammars. No samples, no streaming, no network."
				})
			]
		})
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-bg-elevated px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-[10px] tracking-[0.16em] text-muted uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "mt-1 font-mono text-sm tabular text-fg",
			children: value
		})]
	});
}
function Meter({ peak, running }) {
	const width = Math.max(2, Math.min(100, peak * 140));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-28 sm:w-40",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-1 text-right text-[10px] tracking-[0.16em] text-muted uppercase",
			children: "Level"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-1.5 overflow-hidden rounded-full bg-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("h-full rounded-full bg-accent transition-[width] duration-150", !running && "opacity-40"),
				style: { width: `${width}%` }
			})
		})]
	});
}
function Label({ children, htmlFor }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		htmlFor,
		className: "text-[11px] font-medium tracking-[0.16em] text-muted uppercase",
		children
	});
}
function SliderRow({ value, onChange, display, max = 100 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 flex items-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "range",
			min: 0,
			max,
			value,
			onChange: (e) => onChange(Number(e.target.value)),
			className: "h-11 w-full accent-accent",
			suppressHydrationWarning: true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "w-12 text-right font-mono text-sm tabular text-fg",
			children: display
		})]
	});
}
function EventBtn({ label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		variant: "secondary",
		size: "sm",
		className: "h-11 w-full",
		onClick,
		children: label
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block text-xs text-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-2 block tracking-[0.14em] uppercase",
			children: label
		}), children]
	});
}
function labelFor(id) {
	return WORLDS.find((w) => w.id === id)?.label ?? id;
}
function optionLabel(value) {
	return value.slice(0, 1).toUpperCase() + value.slice(1);
}
function downloadBlob(blob, name) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = name;
	a.click();
	URL.revokeObjectURL(url);
}
var SECTION_LOOP = [
	"INTRO",
	"A",
	"B",
	"BUILD",
	"PEAK",
	"RECOVERY"
];
function ComposerDebug({ diag, onSolo, onMute, onClear, onLoop, onRestart, onNext }) {
	const phrase = diag.phrase;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-lg bg-surface p-4 shadow-border sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Composer debug" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Lab only. Solo a layer to hear whether the counter, bass, or arp is the problem. Loop a section to judge phrasing. Not exposed in the game."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: SECTION_LOOP.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: diag.sectionLoop === id ? "primary" : "secondary",
					onClick: () => onLoop(diag.sectionLoop === id ? null : id),
					children: ["Loop ", id]
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: onRestart,
						children: "Restart phrase"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: onNext,
						children: "Next phrase"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: onClear,
						children: "Clear solo/mute"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[32rem] text-left text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-medium",
								children: "Layer"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-medium",
								children: "Solo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 font-medium",
								children: "Mute"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: LAB_LAYERS.map((layer) => {
						const solo = diag.soloLayers.includes(layer);
						const mute = diag.mutedLayers.includes(layer);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2 capitalize",
									children: layer
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => onSolo(layer, !solo),
										className: cn("min-h-9 rounded-sm px-3", solo ? "bg-accent text-accent-fg" : "bg-surface-2"),
										children: "Solo"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => onMute(layer, !mute),
										className: cn("min-h-9 rounded-sm px-3", mute ? "bg-danger text-fg" : "bg-surface-2"),
										children: "Mute"
									})
								})
							]
						}, layer);
					}) })]
				})
			}),
			phrase ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanStat, {
						label: "Phrase",
						value: `#${phrase.phraseIndex} ${phrase.role}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanStat, {
						label: "Cadence",
						value: phrase.cadence
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanStat, {
						label: "Motif",
						value: phrase.motifVersion
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanStat, {
						label: "Contour",
						value: phrase.contour
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanStat, {
						label: "Bass",
						value: phrase.bassRole
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanStat, {
						label: "Tension",
						value: `${phrase.tensionOwner} · budget ${phrase.dissonanceBudget}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanStat, {
						label: "Center",
						value: phrase.tonalCenter
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanStat, {
						label: "Chords",
						value: phrase.chords.slice(0, 4).join(" → ")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanStat, {
						label: "Layers",
						value: phrase.orchestration.join(", ")
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-xs text-muted",
				children: "Play a world to inspect the current 8-bar phrase."
			})
		]
	});
}
function PlanStat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-sm bg-bg px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-[10px] tracking-[0.14em] text-muted uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "mt-1 font-mono text-[11px] leading-snug text-fg break-all",
			children: value
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MusicLab, {});
}
//#endregion
export { Home as component };
