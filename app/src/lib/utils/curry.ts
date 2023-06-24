// import {  filter, findFirst, reduce } from "./collections";

// type TypedFunction<P extends ReadonlyArray<any> = any, R = any> = (...args: P) => R;

// type InferPipe<FN extends Array<TypedFunction<any, any>>> = FN extends []
//   ? TypedFunction<any, any>
//   : FN extends [infer F, ...infer Rest]
//   ? F extends TypedFunction<infer Params, infer R>
//     ? Params extends []
//       ? Rest extends Array<TypedFunction<any, any>>
//         ? InferPipe<Rest> extends TypedFunction<any[], infer NextR>
//           ? (...args: Params) => NextR
//           : never
//         : never
//       : F extends TypedFunction<Params, infer FR>
//         ? Rest extends [...infer Head extends TypedFunction<any, any>[], infer Tail extends TypedFunction<any, any>]
//           ? InferPipe<Head> extends TypedFunction<any, infer NextR>
//             ? (...args: Params) => NextR
//             : (...args: Params) => ReturnType<Tail>
//             : FR
//           : never
//     : never
//   : never;

//   function reducePipe<FN extends ReadonlyArray<TypedFunction<any, any>>>(...funcs: FN)
// function createPipe<FN extends Array<TypedFunction<any, any>>>(...funcs: FN): InferPipe<FN> {
//   return ((...args: Parameters<FN[0]>) => {
//     let result: ReturnType<FN[0]> = funcs[0](...args as never[]);
//     for (let i = 1; i < funcs.length; i++) {
//       result = funcs[i](result);
//     }
//     return result;
//   }) as InferPipe<FN>;
// }

// const p = createPipe(reduce<number, number[]>, filter, findFirst<number>);
// const r = p([...Array(20).keys()].map((v) => +v), (acc: number[], val: number) => {
//     acc.push(val);
//     return acc;
//   }, [] as number[]);
