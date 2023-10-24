
import { EventEmitter } from 'eventemitter3';
import { PlaygroundView } from '../playground/playground';
import { RenderablesFactory } from './renderables-factory';

export interface RendererOptions{}

/**
 * Renderer is responsible for drawing items and their state onto
 * the view. It puts elements that will be drawn by the view.
 * 
 * Renderer is also responsible for rendering response to user interactions.
 * Set of items that can be rendered is provided by renderables factory.
 * 
 */
export abstract class Renderer {
    view: PlaygroundView|undefined;
    renderablesFactory: RenderablesFactory|undefined;
    emitter: EventEmitter;
    options: RendererOptions;
    constructor(emitter:EventEmitter, options?: RendererOptions){
        this.emitter = emitter;
        this.options = options || {}
    }
    /**
     * Renderer renders the game into provided view
     * @param view target view where to draw the game
     */
    abstract setView(view: PlaygroundView):void;

    setRenderablesFactory(factory: RenderablesFactory):void{
        this.renderablesFactory = factory;
    }
}