import {Store} from 'redux';

/** Function that takes in the state, and assigns it to the custom elements properties */
export type MapStateToPropsFunction = (state: any, el: any) => {};

/** Object of Redux actions to map to a custom event fired from the element */
export interface DispatchMap {
    [key: string]: Function;
}

type mapDispatchToEventsFunction = (el: any) => DispatchMap;

/** Decorator for adding redux to a custom element from Native Web Components */
export default (
    store: Store<any>,
    mapStateToProps: MapStateToPropsFunction | false,
    mapDispatchToEvents?: DispatchMap | mapDispatchToEventsFunction
) => {
    return function classDecorator<T extends { new(...args: any[]): {} }>(constructor: T) {
        return class Element extends constructor {
            private _eventDispatchMap: DispatchMap = {};

            constructor(...args: any[]) {
                super();
                this._bindEventsToDispatch();
            }

            private _bindEventsToDispatch() {
                // Remove old events
                for (const [type, event] of Object.entries(this._eventDispatchMap)) {
                    // @ts-ignore Function is valid
                    this.removeEventListener(type, event);
                }
                this._eventDispatchMap = {};

                // Map dispatch to events
                if (this.mapDispatchToEvents) {
                    for (const [type, func] of Object.entries(this.mapDispatchToEvents)) {
                        this._eventDispatchMap[type] = async (event: CustomEvent) => {
                            event.stopImmediatePropagation();

                            // If event.detail is array, expand array into parameters
                            let fn;
                            if (event.detail instanceof Array) fn = func(...event.detail);
                            // Otherwise use event.detail as an object
                            else fn = func(event.detail);

                            const detail = await fn(store.dispatch);
                            // @ts-ignore
                            (this.shadowRoot || this).dispatchEvent(
                                new CustomEvent(`${type}-done`, {
                                    bubbles: true,
                                    detail
                                })
                            );
                        };
                        // @ts-ignore
                        this.addEventListener(type, (e: Event) => this._eventDispatchMap[type](e));
                    }
                }

                // Map state to props
                if (this._mapStateToProps) {
                    const setProps = (props: object) => Object.assign(this, props);
                    const update = () => setProps(this._mapStateToProps(store.getState()));
                    // Sync with store
                    store.subscribe(update);
                    update();
                }
            }

            private _mapStateToProps(state: Store<any>) {
                if (!mapStateToProps) return false;
                return mapStateToProps(state, this);
            }

            get mapDispatchToEvents(): DispatchMap | undefined {
                if (typeof mapDispatchToEvents === 'function') return mapDispatchToEvents(this);
                return mapDispatchToEvents;
            }
        };
    };
};
