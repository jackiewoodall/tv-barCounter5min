// barCounter5min v1.3 2023-03-16 JackieW

// Description:
//      An Al Brooks style 5min bar count labeler. This custom indicator will
//      label bar 1 and every even bar in the regular trading cash session on a
//      5min candlestick chart. Just like Al's setup.

// Release v1.1
//      o label all bars of the 24 hour session
//      o hilight hourly bars and bar 18
//
// Release v1.2
//      o account for daylight savings time
//
// Release v1.3
//      o attempt #2 of DST, convert time to NYC
//

const predef = require("./tools/predef");
const meta = require("./tools/meta");
const {px, du, op} = require('./tools/graphics')

const colorStandard = "#888"
const color18       = "#0cc"
const colorHourly   = "#f00"

class BarCounter5min {
    map(d) {
        const localTS = d.timestamp()
        const ts = new Date(localTS.toLocaleString("en-US", {timeZone: "America/New_York"}))

        const localNow = new Date()
        const nycNow = new Date(localNow.toLocaleString("en-US", {timeZone: "America/New_York"}))
        const isToday = nycNow.getDate() == ts.getDate()

        const secPerHour = 3600
        const secPerMin = 60
        const secPer5min = 300
        const timestamp5min = Math.floor((ts.getHours()*secPerHour + ts.getMinutes()*secPerMin + ts.getSeconds())  / secPer5min)

        const barCount = timestamp5min - 113 // cash session (RTH) begins at bar 114 (9:30am EST)

        const fiveMinBarsPerDay = 288
        const textValue = barCount > 0 ? barCount: (fiveMinBarsPerDay + barCount)

        const shouldDraw = (!this.props.todayOnly || isToday) && ((textValue) == 1 || ((textValue+1) % 2))

        const color = (barCount == 18) ? color18 : (barCount%12 == 0) ? colorHourly : colorStandard
        
        return {
            graphics: shouldDraw && {
                items: [
                    {
                        conditions: {
                            scaleRangeX: { min: 5 }
                        },
                        tag: "Text",
                        key: "barCountText",
                        text: `${textValue}`,
                        point: {
                            x: op(du(d.index()), '-', px(0)),
                            y: op(du(d.low()), '+', px(14))
                        },
                        style: { fontSize: 12, fill: color },
                        textAlignment: "centerMiddle"
                    }
                ]
            }
        }
    }
}

module.exports = {
    name: "barCounter5min",
    description: "Bar Counter 5min",
    calculator: BarCounter5min,
    tags: ["Price Action"],
    params: {
       todayOnly: {
               type: "boolean",
               def: false,
       }
    },
    inputType: meta.InputType.BARS,
}
