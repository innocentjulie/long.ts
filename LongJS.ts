module net{
    export class long {
        public constructor(lowerUint: number = 0, higherUint: number = 0) {
            this._lowValue = lowerUint;
            this._highValue = higherUint;
        }


        _highValue: number = 0;
        /**
         * 高32位整型数字
         */
        public get higherUint(): number {
            return this._highValue;
        }
        public set higherUint(value: number) {
            if (this._highValue == value)
                return;
            this._highValue = value;
            this.cacheBytes = null;
            this.cacheString = [];
        }

        private _lowValue: number = 0;
        /**
         * 低32位整型数字
         */
        public get lowerUint(): number {
            return this._lowValue;
        }
        public set lowerUint(value: number) {
            this._lowValue = value;
            if (this._lowValue == value)
                return;
            this.cacheBytes = null;
            this.cacheString = [];
        }

        /**
         * 缓存的字符串
         */
        private cacheString: Array<string> = new Array<string>();
        /**
         * 缓存的字节流
         */
        private cacheBytes: egret.ByteArray;


        /**
         * 从字符串生成数字
         * @param value 要转换为数字的字符串。
         * @param radix 要用于字符串到数字的转换的基数（从 2 到 36）。如果未指定 radix 参数，则默认值为 10。
         */
        public fromString(value: string, radix: number = 10): void {
            if (!value) {
                this.reset();
                return;
            }
            value = value.toLowerCase();
            var div: number = 4294967296;
            let low: number = 0;
            var high: number = 0;
            for (var i: number = 0; i < value.length; i++) {
                var num: number = value.charCodeAt(i) - 48;
                if (num > 9)
                    num -= 39;
                low = low * radix + num;
                high = high * radix + (low / div >> 0);
                low = low % div;
            }
            this._lowValue = low;
            this._highValue = high;
            this.cacheString = [];
            this.cacheString[radix] = value;
            this.cacheBytes = null;
        }
        /**
         * 从字节流数组中读取uint64数字
         * @param bytes 包含64位无符号整型的字节流
         * @param position 要从字节流中开始读取的偏移量
         */

        public fromBytes(bytes: egret.ByteArray, position: number = 0): void {
            try {
                bytes.position = position;
                if (bytes.endian == egret.Endian.LITTLE_ENDIAN) {
                    this._lowValue = bytes.readUnsignedInt();
                    this._highValue = bytes.readUnsignedInt();
                }
                else {
                    this._highValue = bytes.readUnsignedInt();
                    this._lowValue = bytes.readUnsignedInt();
                }
            }
            catch (e) {
                this.reset();
                return;
            }
            this.cacheBytes = null;
            this.cacheString = [];
        }
        /**
         * 重置为0
         */
        private reset(): void {
            this._highValue = 0;
            this._lowValue = 0;
            this.cacheBytes = null;
            this.cacheString = [];
        }
        /**
         * 克隆一个数字
         */
        public clone(): long {
            return new long(this._lowValue, this._highValue);
        }
        public copy(value: long): void {
            this.reset();
            this._lowValue = value._lowValue;
            this._highValue = value._highValue;
        }
        public cloneTo(value: long): long{
            if (value == null) {
                value = new long();
            }
            value.copy(this);
            return value;
        }
        public equals(value: long): boolean {
            if (value == null) return false;
            return this._highValue == value._highValue && this._lowValue == value._lowValue;
        }

        /**
         * 返回数字的字节流数组形式,存储方式为Endian.LITTLE_ENDIAN。
         */
        public get bytes(): egret.ByteArray {
            if (this.cacheBytes)
                return this.cacheBytes;
            this.cacheBytes = new egret.ByteArray();
            this.cacheBytes.endian = egret.Endian.LITTLE_ENDIAN;
            this.cacheBytes.writeUnsignedInt(this._lowValue);
            this.cacheBytes.writeUnsignedInt(this._highValue);
            return this.cacheBytes;
        }

        /**
         * 返回数字的字符串表示形式。
         * @param radix 指定要用于数字到字符串的转换的基数（从 2 到 36）。如果未指定 radix 参数，则默认值为 10。
         */
        public toString(radix: number = 10): string {
            if (radix < 2 || radix > 36) {
                throw new RangeError("基数参数必须介于 2 到 36 之间；当前值为 " + radix + "。");
            }
            if (this.cacheString[radix])
                return this.cacheString[radix];
            var result: string = "";
            var lowUint: number = this._lowValue;
            var highUint: number = this._highValue;
            var highRemain: number;
            var lowRemain: number;
            var tempNum: number;
            var MaxLowUint: number = Math.pow(2, 32);
            while (highUint != 0 || lowUint != 0) {
                highRemain = (highUint % radix);
                tempNum = highRemain * MaxLowUint + lowUint;
                lowRemain = tempNum % radix;
                result = lowRemain.toString(radix) + result;
                highUint = (highUint - highRemain) / radix;
                lowUint = (tempNum - lowRemain) / radix;
            }
            this.cacheString[radix] = result;
            return this.cacheString[radix];
        }
        public parseData(data: egret.ByteArray): void {
            this._highValue = data.readUnsignedInt();
            this._lowValue = data.readUnsignedInt();
        }
        public toData(data: egret.ByteArray): void {
            data.writeUnsignedInt(this._highValue);
            data.writeUnsignedInt(this._lowValue);
        }
        public gc(): void {
            this.cacheBytes = null;
            this.cacheString = null;
        }
    }
}