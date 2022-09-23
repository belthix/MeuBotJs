/**
 * Author: Jire Lou 
 * Creation Date: 09/14/2022
 * Last Modification Date: 09/14/2022
 * Purpose: Defines terminal class and exports it
**/

const { createEnum } = require("./enumerator.js");

const ESC = `\x1b[`;
const CON = `;`;

class Terminal {
    constructor(x = 1, y = 1) {
        this.clear();

        this.#pos = { last: {x, y}, cur: {x, y} };

        this.changePos(1, y);
        this.clear.line();
        this.changePos(x, y);
    }

    //Writing
    write = (str) => { process.stdout.write(str); }
    writel = (str) => { this.write(`${str}\n`); }

    //Moving
    move = (() => {
        function main(x = 0, y = 0) {
            if (x < 0) this.move.back(-x);
            else if (x > 0) this.move.forward(x);
    
            if (y < 0) this.move.up(-y);
            else if (y > 0) this.move.down(y);

            return this.#pos.cur;
        }

        main.up = (rows = 1) => {
            this.#modify(`A`, rows);

            return this.#setPos(this.#pos.last.x, (this.#pos.last.y - rows));
        }
        main.down = (rows = 1) => {
            this.#modify(`B`, rows);

            return this.#setPos(this.#pos.last.x, (this.#pos.last.y + rows));
        }
        main.forward = (cols = 1) => {
            this.#modify(`C`, cols);

            return this.#setPos((this.#pos.last.x + cols), this.#pos.last.y);
        }
        main.back = (cols = 1) => {
            this.#modify(`D`, cols);

            return this.#setPos((this.#pos.last.x - cols), this.#pos.last.y);
        }

        main.lineBelow = (lines) => {
            this.#modify(`E`, lines);

            return this.#setPos(1, this.#pos.last.y + lines);
        }
        main.lineAbove = (lines) => {
            this.#modify(`F`, lines);

            return this.#setPos(1, this.#pos.last.y - lines);
        }

        return main;
    })();

    //Setting
    changeCol = (x = 1) => { this.#modify(`G`, x); }
    changePos = (x = this.#pos.cur.x, y = this.#pos.cur.y) => {
        this.#modify(`H`, `${y}${CON}${x}`);
        return this.#setPos(x, y);
    }

    //Screen Modifiers
    replace = (x, y, char = ` `) => {
        this.#setPos(x, y);
        this.write(char);
        this.#setPos(this.#pos.last.x, this.#pos.last.y);
    }

    clear = (() => {
        function main(modifier = clearType.all) {
            this.#modify(`J`, modifier);
        }

        main.line = (lines = 1, modifier = clearType.toEnd) => {
            if (modifier == clearType.all) modifier = clearType.toEnd;
            
            const move = (modifier) ? this.move.back : this.move.forward;
            for (let i = 0; i < lines; i++) {
                move();
                this.#modify(`K`, clearType.all);
            }
        }

        return main;
    })();

    //Private
    //

    #pos;

    #modify = (func, modifier) => { this.write(`${ESC}${modifier}${func}`); }
    #setPos = (x = 1, y = 1) => {
        this.#pos.last = this.#pos.cur;
        this.#pos.cur = {x, y};

        return this.#pos;
    }

}


const clearType = createEnum([`toEnd`, `toStart`, `all`]);

module.exports = { Terminal, clearType, };
