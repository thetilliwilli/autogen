// require("metagen")
//     .from({ source: "./requests" })
//     .with(x => ({
//         extractType(input) {
//             const match = input.match(/type\s+(\w+)\s*=\s*\{([\s\S]*?)\}/);
//             if (!match) return null;
//             return {
//                 type: match[1],
//                 body: match[2].trim()
//             };
//         },
//         createTaggedClass(x) {
//             return `
// class ${x.type} {
//     kind = "${x.type}";
//     ${x.body}
// }`
//         }
//     }))
//     .with(x => ({
//         details: x.files
//             .map(f => x.extractType(f.content))
//             .filter(x => x != null)
//     }))
//     .make(ctx => `
// ${ctx.details.map(x => ctx.createTaggedClass(x)).join("\n")}
// export type CarRequestsDescriminatedUnion = ${ctx.details.map(x => x.type).join("|")};
// `)
//     /* .maket`${x=>x.details.map(d => x.createTaggedClass(d)).join("\n")}
// export type CarRequestsDescriminatedUnion = ${x=>x.details.map(d => d.type).join("|")};` */
//     .__metagend__;

 
 class CarDeleteRequest {
     kind = "CarDeleteRequest";
     id: string;
 }

 class CarGetRequest {
     kind = "CarGetRequest";
     id: string;
 }

 class CarListRequest {
     kind = "CarListRequest";
     
 }
 export type CarRequestsDescriminatedUnion = CarDeleteRequest|CarGetRequest|CarListRequest;
 