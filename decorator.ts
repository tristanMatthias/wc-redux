import {Store} from 'redux';

/** Function that takes in the state, and assigns it to the custom elements properties */
export type MapStateToPropsFunction = (state: object) => {};

/** Object of Redux actions to map to a custom event fired from the element */
export interface DispatchMap {
    [key: string]: Function
};

/** Decorator for adding redux to a custom element from Native Web Components */
export default (store: Store<any>, mapStateToProps: MapStateToPropsFunction, mapDispatchToEvents: DispatchMap) => {
    return (SuperClass: object) => class extends (SuperClass as { new(): any; }) {
        private _eventDispatchMap: DispatchMap = {};
        constructor() {
            super();
            this._bindEventsToDispatch();
        }

        private _bindEventsToDispatch() {
            // Remove old events
            for (const [type, event] of Object.entries(this._eventDispatchMap)) {
                this.removeEventListener(type, event);
            }
            this._eventDispatchMap = {};

            // Map dispatch to events
            if (this.mapDispatchToEvents) {
                for (const [type, func] of Object.entries(this.mapDispatchToEvents)) {
                    this._eventDispatchMap[type] = async (event: CustomEvent) => {
                        event.stopImmediatePropagation();
                        const detail = await func(store.dispatch)(...event.detail || []);

                        this.shadowRoot.dispatchEvent(new CustomEvent(`${type}-done`, {
                            bubbles: true,
                            detail
                        }));
                    };
                    this.addEventListener(type, this._eventDispatchMap[type]);
                }
            }

            // Map state to props
            if (this._mapStateToProps) {
                const setProps = this.setProperties
                    ? (props: object) => this.setProperties(props)
                    : (props: object) => Object.assign(this, props);
                const update = () => setProps(this._mapStateToProps(store.getState()));
                // Sync with store
                store.subscribe(update);
                update();
            }
        }

        _mapStateToProps(state: Store<any>) {
            return mapStateToProps(state);
        }

        get mapDispatchToEvents() {
            return mapDispatchToEvents;
        }
    }
}
