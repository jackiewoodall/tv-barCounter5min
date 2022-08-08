// barCounter5min v1.1 2022-08-08 JackieW

// Description:
//      An Al Brooks style 5min bar count labeler. This custom indicator will
//      label bar 1 and every even bar in the regular trading cash session on a
//      5min candlestick chart. Just like Al's setup.

// Release v1.1
//      o label all bars of the 24 hour session
//      o hilight hourly bars and bar 18

const predef = require("./tools/predef");
const meta = require("./tools/meta");
const {px, du, op} = require('./tools/graphics')

const colorStandard = "#888"
const color18       = "#0cc"
const colorHourly   = "#f00"

class BarCounter5min {
    map(d) {
        const ts = d.timestamp()
        const now = new Date()
        const isToday = now.getDate() == ts.getDate()
        const timestamp5min = Math.floor(((ts.getTime() / 1000) % 86400) / 300)  // convert to UTC epoch seconds and then to a 5min bar count
        const barCount = timestamp5min - 161   // cash session (RTH) begins at bar 162 (9:30am EST)
        const textValue = barCount > 0 ? barCount: (300 + barCount)
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
