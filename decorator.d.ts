import { Store } from 'redux';
/** Function that takes in the state, and assigns it to the custom elements properties */
export declare type MapStateToPropsFunction = (state: any, el: any) => {};
/** Object of Redux actions to map to a custom event fired from the element */
export interface DispatchMap {
    [key: string]: Function;
}
declare const _default: (store: Store<any>, mapStateToProps: false | MapStateToPropsFunction, mapDispatchToEvents?: DispatchMap | ((el: any) => DispatchMap) | undefined) => <T extends new (...args: any[]) => {}>(constructor: T) => {
    new (...args: any[]): {
        _eventDispatchMap: DispatchMap;
        _bindEventsToDispatch(): void;
        _mapStateToProps(state: Store<any>): {};
        readonly mapDispatchToEvents: DispatchMap | undefined;
    };
} & T;
export default _default;
