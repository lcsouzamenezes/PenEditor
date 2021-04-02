import React, { useEffect, useCallback, useRef, useState } from "react";
import { saveAs } from "file-saver";
import Tooltip from "react-tooltip-lite";
import GitHubButton from "react-github-btn";
import init from "./init";

//code mirror 核心
import * as CodeMirror from "codemirror/lib/codemirror";

import "./formatting";

import "codemirror/lib/codemirror.css";

//主题
import "codemirror/theme/material.css";

//语法支持
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/css/css";

//折叠
import "codemirror/addon/fold/foldcode";
import "codemirror/addon/fold/foldgutter";
import "codemirror/addon/fold/brace-fold";
import "codemirror/addon/fold/comment-fold";
import "codemirror/addon/fold/foldgutter.css";

//括号匹配
import "codemirror/addon/edit/matchbrackets";

//代码补全
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/javascript-hint";
import "codemirror/addon/hint/html-hint";
import "codemirror/addon/hint/css-hint";
import "codemirror/addon/hint/show-hint.css";

//快捷键方案
import "codemirror/keymap/sublime.js";

//emmet 插件
import emmet from "@emmetio/codemirror-plugin";

import "./bulma.min.css";
import "./index.less";

import logo from "./editor.png";

emmet(CodeMirror);

function createNode(htmlStr) {
	var div = document.createElement("div");
	div.innerHTML = htmlStr;
	return div.childNodes[0];
}

let codeMirrorCommonOption = {
	lineWrapping: true,
	foldGutter: true,
	gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
	matchBrackets: true,
	smartIndent: true,
	indentUnit: 4,
	theme: "material", //编辑器主题
	keymap: "sublime",
	extraKeys: {
		Tab: "emmetExpandAbbreviation",
		Esc: "emmetResetAbbreviation",
		Enter: "emmetInsertLineBreak",
		Ctrl: "autocomplete",
	},
	lineNumbers: true,
};

export default (params) => {
	let [mode, setMode] = useState("js");

	let staticRef = useRef({
		js: null,
		css: null,
		html: null,
		lib: ["static/console.js", "static/babel.min.js", "https://unpkg.com/react/umd/react.development.js", "https://unpkg.com/react-dom/umd/react-dom.development.js"],
	});

	useEffect(() => {
		window.addEventListener("message", function (data) {
			if (data.data && ["log", "error", "info"].includes(data.data.type)) {
				let console = document.getElementById("console");
				console.appendChild(createNode(data.data.data));
				console.scrollTop = console.scrollHeight;
			}
		});
		staticRef.current.js = CodeMirror.fromTextArea(document.getElementById("js"), {
			mode: "javascript", //编辑器语言
			...codeMirrorCommonOption,
		});
		staticRef.current.js.setOption("value", init.javascript);
		staticRef.current.html = CodeMirror.fromTextArea(document.getElementById("html"), {
			mode: "htmlmixed",
			...codeMirrorCommonOption,
		});
		staticRef.current.html.setOption("value", init.html);
		staticRef.current.css = CodeMirror.fromTextArea(document.getElementById("css"), {
			mode: "css", //编辑器语言
			...codeMirrorCommonOption,
		});
		staticRef.current.css.setOption("value", init.css);
		onFormat("js");
		onFormat("css");
		onFormat("html");
		onRun();
	}, []);

	const onDownload = useCallback(() => {
		let lib = "";
		staticRef.current.lib.map((item) => {
			lib += `<script src="${item}"></script>`;
		});
		let reset = `html {
			width: 100%;
			height: 100%;
		}
		body {
			width: 100%;
			height: 100%;
			margin: 0;
		}`;
		var html = `
				<!DOCTYPE html>
		<html lang="en">
			<head><style>${reset}</style><style>${staticRef.current.css.getValue()}</style></head>
			<body>${staticRef.current.html.getValue()}${lib}<script>${staticRef.current.js.getValue()}</script></body>
		</html>`;

		var blob = new Blob([html], { type: "text/html; charset=utf-8" });
		saveAs(blob, `PenEditor-${new Date().getTime()}.html`);
	}, []);

	const onFormat = useCallback((type) => {
		let editor = staticRef.current[type];
		editor.execCommand("selectAll");
		editor.autoFormatRange(editor.getCursor(true), editor.getCursor(false));
		editor.execCommand("goDocEnd");
	}, []);

	const onLoad = useCallback(() => {
		let iframe = document.getElementById("preview"),
			html = staticRef.current.html.getValue(),
			css = staticRef.current.css.getValue(),
			js = staticRef.current.js.getValue();

		var preview;
		if (iframe.contentDocument) {
			preview = iframe.contentDocument;
		} else if (iframe.contentWindow) {
			preview = iframe.contentWindow.document;
		} else {
			preview = iframe.document;
		}
		let lib = "";
		staticRef.current.lib.map((item) => {
			lib += `<script src="${item}"></script>`;
		});
		preview.open();
		preview.write(`${lib}${html}<script  type="text/babel" data-presets="react">${js}</script>`);
		preview.close();
		preview.head.innerHTML = `
			<link rel="stylesheet" href="./static/view.css">
			<style>${css}</style>
		`;
	}, []);

	const onRun = useCallback(() => {
		let iframe = document.getElementById("preview");
		iframe.contentWindow.location.reload(true);
	}, []);

	return (
		<div className="runjs">
			<div className="runjs__header">
				<div class="nav center" style={{ paddingLeft: 20, width: 240 }}>
					<img style={{ height: 36 }} src={logo} alt="" />
					<div style={{ width: 40 }}></div>
					<Tooltip content="JS Editor">
						<div class={mode == "js" ? "tool-icon selected" : "tool-icon"} onClick={() => setMode("js")}>
							<svg t="1617356384664" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2065" width="128" height="128">
								<path
									fill="currentColor"
									d="M617.728 635.008a173.269333 173.269333 0 0 1-93.312-16.981333 61.397333 61.397333 0 0 1-22.869333-43.093334 9.472 9.472 0 0 0-9.642667-9.386666 1997.909333 1997.909333 0 0 0-40.533333 0 9.002667 9.002667 0 0 0-9.856 7.936 99.797333 99.797333 0 0 0 32.128 78.677333 170.282667 170.282667 0 0 0 95.061333 35.797333 343.978667 343.978667 0 0 0 108.074667-4.608 133.376 133.376 0 0 0 71.594666-38.570666 99.754667 99.754667 0 0 0 16.896-95.189334 79.744 79.744 0 0 0-52.48-46.72c-54.613333-19.2-113.664-17.706667-169.386666-32.298666-9.685333-2.986667-21.504-6.314667-25.813334-16.554667a36.48 36.48 0 0 1 12.117334-40.746667 109.141333 109.141333 0 0 1 57.6-14.336 173.653333 173.653333 0 0 1 80.341333 11.52 61.269333 61.269333 0 0 1 29.312 42.325334 10.368 10.368 0 0 0 9.728 10.069333c13.397333 0.256 26.794667 0.042667 40.234667 0.085333a9.728 9.728 0 0 0 10.538666-7.168 103.850667 103.850667 0 0 0-50.645333-89.856 250.88 250.88 0 0 0-137.301333-21.034666 149.546667 149.546667 0 0 0-92.842667 37.333333 92.8 92.8 0 0 0-18.517333 96.512 82.346667 82.346667 0 0 0 51.968 45.312c54.485333 19.669333 114.176 13.354667 169.130666 30.762667 10.752 3.626667 23.210667 9.216 26.496 21.12a42.24 42.24 0 0 1-11.52 40.362666 126.72 126.72 0 0 1-76.501333 18.730667z m248.277333-360.32q-159.488-90.197333-319.104-180.266667a71.552 71.552 0 0 0-69.845333 0L159.146667 273.962667a65.792 65.792 0 0 0-34.346667 57.258666v361.6a66.261333 66.261333 0 0 0 35.669333 57.813334c30.421333 16.554667 59.989333 34.816 91.008 50.304a130.730667 130.730667 0 0 0 116.821334 3.2 90.752 90.752 0 0 0 42.453333-81.962667c0.213333-119.338667 0-238.677333 0.085333-357.973333a9.386667 9.386667 0 0 0-8.832-10.88 1773.013333 1773.013333 0 0 0-40.661333 0 8.96 8.96 0 0 0-9.728 9.088c-0.170667 118.570667 0.042667 237.141333-0.085333 355.754666a40.106667 40.106667 0 0 1-26.026667 37.674667 65.365333 65.365333 0 0 1-52.906667-7.082667l-84.565333-47.786666a10.112 10.112 0 0 1-5.76-10.026667V333.098667a11.050667 11.050667 0 0 1 6.698667-11.093334q158.421333-89.258667 316.8-178.645333a11.008 11.008 0 0 1 12.458666 0l316.842667 178.602667a11.178667 11.178667 0 0 1 6.656 11.093333v357.888a10.325333 10.325333 0 0 1-5.717333 10.154667q-155.989333 88.234667-312.192 176.213333c-4.949333 2.730667-10.837333 7.210667-16.64 3.84-27.306667-15.445333-54.186667-31.488-81.408-47.061333a8.789333 8.789333 0 0 0-9.813334-0.597334 222.634667 222.634667 0 0 1-37.632 17.578667c-5.888 2.389333-13.141333 3.072-17.194666 8.533333a56.149333 56.149333 0 0 0 18.432 13.226667l95.402666 55.168a69.546667 69.546667 0 0 0 70.613334 1.962667q158.976-89.6 317.952-179.370667a66.389333 66.389333 0 0 0 35.669333-57.770667V331.221333a65.706667 65.706667 0 0 0-33.194667-56.533333z"
									p-id="2066"></path>
							</svg>
						</div>
					</Tooltip>
					<Tooltip content="Html Editor">
						<div class={mode == "html" ? "tool-icon selected" : "tool-icon"} onClick={() => setMode("html")}>
							<svg t="1617358803258" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="20414" width="128" height="128">
								<path
									fill="currentColor"
									d="M204.8 819.2v-102.4H102.4v102.4H51.2v-256h51.2v102.4h102.4v-102.4h51.2v256H204.8z m153.6 0v-204.8H286.72v-51.2h189.44v51.2H409.6v204.8H358.4z m153.6 0v-256h51.2l71.68 174.08h5.12L716.8 563.2h51.2v256h-51.2v-158.72h-5.12l-56.32 128h-30.72l-56.32-128H563.2V819.2h-51.2z m460.8 0h-153.6v-256h51.2v204.8h102.4v51.2zM481.28 215.04L363.52 332.8l117.76 117.76-30.72 61.44-179.2-179.2L450.56 153.6l30.72 61.44z m61.44 235.52l117.76-117.76-117.76-117.76 30.72-61.44 179.2 179.2-179.2 179.2-30.72-61.44z"
									p-id="20415"></path>
							</svg>
						</div>
					</Tooltip>
					<Tooltip content="Css Editor">
						<div class={mode == "css" ? "tool-icon selected" : "tool-icon"} name="css" onClick={() => setMode("css")}>
							<svg t="1617356593987" class="icon" viewBox="0 0 1567 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7858" width="128" height="128">
								<path
									fill="currentColor"
									d="M0 846.490239h1516.10192v151.610192H0v-151.610192z m415.058169-373.971807a131.648183 131.648183 0 0 1-123.51177 88.388742 133.416969 133.416969 0 0 1-100.365947-47.049696 107.996993 107.996993 0 0 1-25.268365-54.630206 754.260705 754.260705 0 0 1-7.125679-129.272957 771.0389 771.0389 0 0 1 7.125679-130.132082 107.238942 107.238942 0 0 1 25.268365-53.771081 124.421431 124.421431 0 0 1 40.884215-33.303706 134.983608 134.983608 0 0 1 59.481732-13.745991 127.908465 127.908465 0 0 1 79.949108 27.087688 142.867338 142.867338 0 0 1 43.562662 66.607411h103.903518a244.244019 244.244019 0 0 0-74.592214-136.449173 219.531558 219.531558 0 0 0-152.823074-55.590404 229.23461 229.23461 0 0 0-202.95551 116.234481 178.647343 178.647343 0 0 0-21.781331 61.755885 1702.68353 1702.68353 0 0 0 0 301.148378 179.658078 179.658078 0 0 0 8.894465 34.617661q5.761187 13.341697 12.886866 27.997348a216.297207 216.297207 0 0 0 75.501876 79.039447 227.415288 227.415288 0 0 0 127.453634 37.346644 231.25608 231.25608 0 0 0 146.152225-48.009894 242.879528 242.879528 0 0 0 81.263063-138.571716H415.058169z m181.224716 24.004947l-64.434331 73.73309a367.250422 367.250422 0 0 0 247.62998 88.843573q222.361615-2.728983 227.415288-188.350396a183.852626 183.852626 0 0 0-43.107831-120.833323 202.146923 202.146923 0 0 0-134.579314-65.293456q-46.190572-5.761187-72.823429-10.107346a124.623578 124.623578 0 0 1-69.740688-31.98975 71.307327 71.307327 0 0 1-21.781331-50.536731 84.143657 84.143657 0 0 1 32.444581-70.195519 122.147278 122.147278 0 0 1 75.501876-22.640455 296.650609 296.650609 0 0 1 160.353046 49.728143l54.630206-80.85877A364.117145 364.117145 0 0 0 777.659212 0.960198a220.491756 220.491756 0 0 0-154.996153 52.40659 177.282851 177.282851 0 0 0-56.398992 136.80293 171.824884 171.824884 0 0 0 44.876617 119.923661A211.496218 211.496218 0 0 0 737.836268 371.44497q46.645402 6.670848 85.912442 11.977206a84.446877 84.446877 0 0 1 84.345804 87.074787q-1.718249 88.388742-127.908466 90.157527A284.066963 284.066963 0 0 1 596.333422 496.270695z m521.892818 0l-64.434332 73.73309a367.250422 367.250422 0 0 0 247.629981 88.843573q222.361615-2.728983 227.415288-188.350396a183.599943 183.599943 0 0 0-43.107832-120.833323 202.146923 202.146923 0 0 0-134.579313-65.293456q-46.190572-5.761187-72.823429-10.107346a124.623578 124.623578 0 0 1-69.740689-31.98975 71.307327 71.307327 0 0 1-21.78133-50.536731 84.143657 84.143657 0 0 1 32.444581-70.195519 122.147278 122.147278 0 0 1 75.501875-22.640455 296.650609 296.650609 0 0 1 160.353047 49.728143l54.630206-80.85877A363.864461 363.864461 0 0 0 1299.602566 0.960198a220.542293 220.542293 0 0 0-155.04669 52.40659 177.282851 177.282851 0 0 0-56.398991 136.80293 171.824884 171.824884 0 0 0 44.876617 119.923661 211.496218 211.496218 0 0 0 126.998804 61.755885q46.695939 6.670848 85.912442 11.977206a84.54795 84.54795 0 0 1 84.39634 87.074786q-1.819322 88.388742-127.959002 90.157528a284.066963 284.066963 0 0 1-183.852626-64.383795z"
									p-id="7859"></path>
							</svg>
						</div>
					</Tooltip>
				</div>
				<div class="tool center" style={{ flex: 1 }}>
					<input
						onKeyDown={(e) => {
							if (e.keyCode == 13) {
								staticRef.current.lib.push(e.target.value);
								e.target.value = "";
							}
						}}
						placeholder="cdn js"
						type="text"
						style={{ width: 400 }}
					/>
				</div>
				<div class="menu" style={{ flex: 1 }}>
					<Tooltip content="Save as html file">
						<div class="tool-icon">
							<svg t="1617359709160" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="31724" width="128" height="128">
								<path
									fill="currentColor"
									d="M885.9 231.5L778 124.5C761.4 108.2 739.1 99 715.9 99H244.1c-62.4 0-131.8 64.3-131.8 131.8v536c0 72.7 59.1 131.8 131.8 131.8h81.4a29.663 29.663 0 0 0 8.4 0h356.5c1.3 0.2 2.8 0.3 4.2 0.3 1.4 0 2.8-0.1 4.2-0.3h81.4c72.7 0 131.8-59.1 131.8-131.8V294.2c0-23.6-9.4-46.1-26.1-62.7zM657.7 825H366.5V702.6h291.2V825z m180.5-58.1c0 32.1-26 58.1-58.1 58.1h-48.7V676.2c0-26.1-21.2-47.3-47.3-47.3h-344c-26.1 0-47.3 21.2-47.3 47.3V825h-48.7c-32.1 0-58.1-26-58.1-58.1v-536c0-18.1 31.9-58.1 58.1-58.1h414.2c40.7 0 79.7 16.1 108.6 44.7l25 24.8c29.6 29.4 46.3 69.4 46.3 111.2v413.4z"
									p-id="31725"></path>
								<path
									fill="currentColor"
									d="M681.6 385.8H337c-20.3 0-36.8 16.5-36.8 36.9 0 20.3 16.5 36.8 36.8 36.8h344.6c20.4 0 36.9-16.5 36.9-36.8 0-20.4-16.5-36.9-36.9-36.9zM681.6 265.8H337c-20.4 0-36.9 16.5-36.9 36.9s16.5 36.9 36.9 36.9h344.6c20.4 0 36.9-16.5 36.9-36.9s-16.5-36.9-36.9-36.9z"
									p-id="31726"></path>
							</svg>
						</div>
					</Tooltip>
					<Tooltip content="Format code">
						<div
							class="tool-icon"
							onClick={() => {
								onFormat("js");
								onFormat("html");
								onFormat("css");
							}}>
							<svg t="1617356539279" class="icon" viewBox="0 0 1075 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6338" width="128" height="128">
								<path
									d="M627.2512 278.272l31.744 14.7968a25.6 25.6 0 0 1 12.3904 33.9968l-189.44 406.3232a25.6 25.6 0 0 1-33.9968 12.3392l-31.744-14.7968a25.6 25.6 0 0 1-12.3904-33.9968l189.44-406.3232a25.6 25.6 0 0 1 33.9968-12.3392z m-316.7744 7.6288l24.7808 24.7808a25.6 25.6 0 0 1 0 36.1984L170.0864 511.9488l165.1712 165.1712a25.6 25.6 0 0 1 2.9696 32.6656l-2.9696 3.584-24.7808 24.7296a25.6 25.6 0 0 1-32.6656 2.9696l-3.5328-2.9696-207.6672-207.6672a25.4976 25.4976 0 0 1-7.424-15.9232V509.44a25.4976 25.4976 0 0 1 7.424-15.872l207.6672-207.7184a25.6 25.6 0 0 1 36.1984 0z m454.2464 0a25.6 25.6 0 0 1 36.1984 0l207.6672 207.6672a25.4976 25.4976 0 0 1 7.424 15.9232v5.0176a25.4976 25.4976 0 0 1-7.424 15.872l-207.6672 207.7184-3.584 2.9696a25.6 25.6 0 0 1-32.6144-2.9696l-24.7808-24.7808-2.9696-3.5328a25.6 25.6 0 0 1 2.9696-32.6656L905.1136 512l-165.1712-165.0688a25.6 25.6 0 0 1 0-36.1984z"
									fill="currentColor"
									p-id="6339"></path>
							</svg>
						</div>
					</Tooltip>
					<Tooltip content="Run code">
						<div class="tool-icon" onClick={onRun}>
							<svg t="1617358085681" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8622" width="128" height="128">
								<path
									fill="currentColor"
									d="M212 208.84575406C212 142.37744563 258.13452125 115.40603938 315.15844531 148.66999626L828.84155563 448.31848626C885.81438781 481.55264188 885.86547781 535.40605062 828.84155563 568.67000563L315.15844531 868.318475C258.18560938 901.55263063 212 874.67062719 212 808.14271719L212 208.84575406Z"
									p-id="8623"></path>
							</svg>
						</div>
					</Tooltip>
				</div>
			</div>
			<div className="runjs__editor">
				<div id="html-wrap" style={{ visibility: mode == "html" ? "visible" : "hidden" }}>
					<textarea class="form-control" id="html"></textarea>
				</div>
				<div id="css-wrap" style={{ visibility: mode == "css" ? "visible" : "hidden" }}>
					<textarea class="form-control" id="css"></textarea>
				</div>
				<div id="js-wrap" style={{ visibility: mode == "js" ? "visible" : "hidden" }}>
					<textarea class="form-control" id="js"></textarea>
				</div>
			</div>
			<div className="runjs__preview">
				<iframe onLoad={onLoad} id="preview" src="./static/view.html" seamless width="100%" height="100%"></iframe>
			</div>
			<div className="runjs__console" id="console"></div>
		</div>
	);
};
