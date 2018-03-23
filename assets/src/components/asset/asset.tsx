import { Component, Prop, Watch, State, Method, Element } from '@stencil/core';

@Component({
	tag: 'techomaha-asset',
	styleUrl: 'asset.scss',
	shadow: true
})
export class Asset {

	/**
	 * This instance of the element
	 * @private
	 * @type {HTMLElement}
	 */
	@Element() element: HTMLElement;

	/**
	 * Source
	 * @default "logo/bug"
	 * @type {string}
	 */
	@Prop() src: string = "logo";

	/**
	 * Handles observing updates to the `src` property
	 * @return {void}
	 */
	@Watch('src')
	observeSrc() {
		this.load();
	}

	/**
	 * Sets the scale of the svg
	 * @default 24
	 * @type {number}
	 */
	@Prop() width: any = 24;

	/**
	 * Sets the scale of the svg
	 * @default 24
	 * @type {number}
	 */
	@Prop() height: any = 24;

	/**
	 * Pulls the width from the source svg.
	 * @type {number}
	 */
	@State() __width: number;

	/**
	 * Pulls the height from the source svg.
	 * @type {number}
	 */
	@State() __height: number;

	/**
	 * Sets the color of the svg.
	 * @default "current"
	 * @type {string}
	 */
	@Prop() color: string = "current";

	/**
	 * Sets the color of the svg.
	 * @default "current"
	 * @type {string}
	 */
	@Watch('color')
	observeColor(value: string) {
		this.updateColor(value);
	}

	/**
	 * Sets the scale of the svg
	 * @default 1
	 * @type {number}
	 */
	@Prop() scale: any = 1;

	/**
	 * Sets the display type of the asset as block.
	 * @default false
	 * @type {boolean}
	 */
	@Prop() block: boolean = false;

	/**
	 * Allows the asset to grow and shrink to it's parent element.
	 * @default false
	 * @type {boolean}
	 */
	@Prop() responsive: boolean = false;

	/**
	 * Sets the title of the SVG for accessibility.
	 * @type {string}
	 */
	@Prop({mutable: true}) title: string;

	/**
	 * Sets the description of the SVG for accessibility.
	 * @type {string}
	 */
	@Prop({mutable: true}) description: string;

	/**
	 * Holds the raw viewbox of the SVG to render which informs width and height.
	 * @private
	 * @type {string}
	 */
	@State() viewbox: string;

	/**
	 * Holds the raw SVG to render.
	 * @private
	 * @type {string}
	 */
	@State() svg: any;

	/**
	 * Responsible for returning the SVG value.
	 * @return {SVGElement} Returns the SVG DOM node.
	 */
	@Method()
	getSVG () {
		return this.svg;
	}

	/**
	 * Method that runs once the component is loaded
	 * @return {void}
	 */
	componentDidLoad() {
		this.load();
		this.updateColor(this.color);
	}

	/**
	 * Returns the asset path set on the window.
	 * @return {string} The path from window["asset_path"]
	 */
	path () {
		return window.location.origin;
	}

	/**
	 * Builds the complete built imageURI
	 * @return {string} combines the path, the src, the asset name, and the extension
	 */
	imageURI () {
		return this.path() + this.src + ".svg"
	}

	/**
	 * Runs the method to place SVG's into DOM.
	 * @return {void}
	 */
	placeSVG() {
		var feature: any = document.head;

		if ((feature.createShadowRoot || feature.attachShadow) && this.element.shadowRoot) {
				var svgWrap = this.element.shadowRoot.querySelector('svg');
		} else {
				var svgWrap = this.element.querySelector('svg');
		}

		// Empty previous svg's
		const svgs = svgWrap.querySelectorAll('svg');

		if (svgs) {
			[].forEach.call(svgs, (element) => {
				svgWrap.removeChild(element);
			})
		}

		svgWrap.appendChild(this.svg.documentElement);

		var collection = svgWrap.querySelectorAll('*');

		[].forEach.call(collection, (element) => {
			element.setAttribute("data-techomaha-asset", "");
		});
	}

	/**
	 * Sets up a promise and resolves appropriately in order to do async rendering.
	 * @return {void}
	 */
	@Method()
	async load () {
		// local storage reference
		const lsref = this.src + "_svg";

		try {
			eval('async () => {}');
			if (!window["asset_promises"][lsref]) {
				window["asset_promises"][lsref] = new Promise((resolve) => {
					this.makeRequest(lsref, resolve);
				}).then(result => {
					return result;
				});
			}

			const rawSvg = await window["asset_promises"][lsref];
			this.loadCallback(rawSvg);
		} catch (e) {
			if (e instanceof SyntaxError) {
				this.makeRequest(lsref, (rawSvg) => {
					this.loadCallback(rawSvg);
				});
			} else {
				throw e;
			}
		}
	}

	/**
	 * Responsible for making a network request or pulling from local storage.
	 * @param  {string}   lsref    The name of the asset to load from LocalStorage.
	 * @param  {Function} callback The method to call when loading is complete. This is where the result if passed.
	 * @return {void}
	 */
	makeRequest(lsref: string, callback: Function) {
		var rawSvg = localStorage.getItem(lsref);

		if (!rawSvg) {
			try {
				var xhr = new XMLHttpRequest();

				xhr.open("GET", this.imageURI(), true);

				xhr.onload = () => {
					if (xhr.readyState === 4) {
						if (xhr.status === 200) {
							rawSvg = xhr.responseXML.querySelector('svg').outerHTML;
							localStorage.setItem(lsref, rawSvg);
							callback(rawSvg);
						} else {
							console.error(`Image at ${this.imageURI()} not found`);
							rawSvg = `<svg viewBox="0 0 0 0"><g></g></svg>`;
							callback(rawSvg);
						}
					}
				};

				xhr.onerror = () => {
					console.error(`Image at ${this.imageURI()} not found`);
					rawSvg = `<svg viewBox="0 0 0 0"><g></g></svg>`;
					callback(rawSvg);
				};

				xhr.send(null);
			} catch (e) {
				console.info(`Image at ${this.imageURI()} not found`);
				rawSvg = `<svg viewBox="0 0 0 0"><g></g></svg>`;
				callback(rawSvg);
			}
		} else {
			callback(rawSvg);
		}
	}

	/**
	 * The method called when an SVG is pulled. Parses a string to DOM, updates state, then places the svg.
	 * @param  {string} rawSvg A string of the raw HTML to parse into a DOM node.
	 * @return {void}
	 */
	loadCallback (rawSvg: string) {
		const parser = new DOMParser();

		let parsedSvg = parser.parseFromString(rawSvg, "text/xml");
		this.setDimensions(parsedSvg.firstChild);

		this.svg = parsedSvg;

		this.placeSVG();
	}

	/**
	 * Updates the colors of the svg.
	 * @param  {string} value The color to apply to the SVG's path's
	 * @return {void}
	 */
	updateColor (value: string) {
		this.element.style.setProperty('--icon-color', value);
	}

	/**
	 * Sets the width and height of the element.
	 * @param {SVGElement} svg The SVG as a DOM node to parse and pull viewbox from.
	 */
	setDimensions (svg: any) {
		const lsref = this.src + "_dimensions";
		let dimensions: { width: number, height: number } = JSON.parse(localStorage.getItem(lsref));

		if (!dimensions) {
			dimensions = {
				'width': ((svg.viewBox) ? svg.viewBox.baseVal.width : 0),
				'height': ((svg.viewBox) ? svg.viewBox.baseVal.height : 0)
			};

			localStorage.setItem(lsref, JSON.stringify(dimensions));
		}

		if (typeof dimensions === "string") {
			dimensions = JSON.parse(dimensions);
		}

		this.__width = (dimensions.width * this.scale);
		this.__height = (dimensions.height * this.scale);
		this.viewbox = "0 0 " + (dimensions.width * this.scale) + " " + (dimensions.height * this.scale);

		this.element.style.setProperty('--icon-width', (dimensions.width * this.scale) + "px");
		this.element.style.setProperty('--icon-height', (dimensions.height * this.scale) + "px");
		this.element.style.setProperty('--icon-aspect-ratio', (((this.__height / this.__width) * 100)).toString() + "%");
	}

	/**
	 * The render function
	 * @return {HTMLElement} the markup to render.
	 */
	render () {
		return (
			<div class={`wrapper ${this.color}`} data-block={this.block} data-responsive={this.responsive}>
				<div class="icon-wrap" id="iconWrap">
					<svg class="icon" role="img" aria-labelledby="title description" xmlns="http://www.w3.org/2000/svg" width={this.__width} height={this.__height} preserveAspectRatio="xMinYMin meet" viewBox={this.viewbox} alt={this.title}>
						<title id="title">{this.title}</title>
						<desc id="description">{this.description}</desc>
					</svg>
				</div>
			</div>
		);
	}
}
