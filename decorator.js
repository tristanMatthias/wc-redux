var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
;
/** Decorator for adding redux to a custom element from Native Web Components */
export default (store, mapStateToProps, mapDispatchToEvents) => {
    return (SuperClass) => class extends SuperClass {
        constructor() {
            super();
            this._eventDispatchMap = {};
            this._bindEventsToDispatch();
        }
        _bindEventsToDispatch() {
            // Remove old events
            for (const [type, event] of Object.entries(this._eventDispatchMap)) {
                this.removeEventListener(type, event);
            }
            this._eventDispatchMap = {};
            // Map dispatch to events
            if (this.mapDispatchToEvents) {
                for (const [type, func] of Object.entries(this.mapDispatchToEvents)) {
                    this._eventDispatchMap[type] = (event) => __awaiter(this, void 0, void 0, function* () {
                        event.stopImmediatePropagation();
                        const detail = yield func(store.dispatch)(...event.detail || []);
                        this.shadowRoot.dispatchEvent(new CustomEvent(`${type}-done`, {
                            bubbles: true,
                            detail
                        }));
                    });
                    this.addEventListener(type, this._eventDispatchMap[type]);
                }
            }
            // Map state to props
            if (this._mapStateToProps) {
                const setProps = this.setProperties
                    ? (props) => this.setProperties(props)
                    : (props) => Object.assign(this, props);
                const update = () => setProps(this._mapStateToProps(store.getState()));
                // Sync with store
                store.subscribe(update);
                update();
            }
        }
        _mapStateToProps(state) {
            return mapStateToProps(state);
        }
        get mapDispatchToEvents() {
            return mapDispatchToEvents;
        }
    };
};
