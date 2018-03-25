import { Store } from 'redux';
/** Function that takes in the state, and assigns it to the custom elements properties */
export declare type MapStateToPropsFunction = (state: object) => {};
/** Object of Redux actions to map to a custom event fired from the element */
export interface DispatchMap {
    [key: string]: Function;
}
declare const _default: (store: Store<any>, mapStateToProps: MapStateToPropsFunction, mapDispatchToEvents: DispatchMap) => (SuperClass: object) => {
    new (): {
        [x: string]: any;
        _eventDispatchMap: DispatchMap;
        _bindEventsToDispatch(): void;
        _mapStateToProps(state: Store<any>): {};
        readonly mapDispatchToEvents: DispatchMap;
    };
};
export default _default;
