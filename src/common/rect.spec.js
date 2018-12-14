const { expect } = require('chai');
const rect = require('./rect');

describe('rect module', () => {
    describe('intersects method', () => {
        const firstRect = {};
        const secondRect = {};
        
        beforeEach(() => {
            firstRect.top = 10;
            firstRect.left = 10;
            firstRect.height = 10;
            firstRect.width = 10;

            secondRect.top = 10;
            secondRect.left = 10;
            secondRect.height = 10;
            secondRect.width = 10;
        });

        describe('registers as intersecting when rectangles overlap', () => {
            it('from the left', () => {
                firstRect.left = 1;
                expect(rect.intersects(firstRect, secondRect)).to.be.true;
            });

            it('from the right', () => {
                firstRect.left = 19;
                expect(rect.intersects(firstRect, secondRect)).to.be.true;
            });

            it('from the top', () => {
                firstRect.top = 1;
                expect(rect.intersects(firstRect, secondRect)).to.be.true;
            });

            it('from the bottom', () => {
                firstRect.top = 19;
                expect(rect.intersects(firstRect, secondRect)).to.be.true;
            });
        });

        describe('registers as intersecting when rectangles touch edges', () => {
            it('from the left', () => {
                firstRect.left = 0;
                expect(rect.intersects(firstRect, secondRect)).to.be.true;
            });

            it('from the right', () => {
                firstRect.left = 20;
                expect(rect.intersects(firstRect, secondRect)).to.be.true;
            });

            it('from the top', () => {
                firstRect.top = 0;
                expect(rect.intersects(firstRect, secondRect)).to.be.true;
            });

            it('from the bottom', () => {
                firstRect.top = 20;
                expect(rect.intersects(firstRect, secondRect)).to.be.true;
            });
        });

        describe('registers as not intersecting when rectangles don\'t touch', () => {
            it('from the left', () => {
                firstRect.left = -1;
                expect(rect.intersects(firstRect, secondRect)).to.be.false;
            });

            it('from the right', () => {
                firstRect.left = 21;
                expect(rect.intersects(firstRect, secondRect)).to.be.false;
            });

            it('from the top', () => {
                firstRect.top = -1;
                expect(rect.intersects(firstRect, secondRect)).to.be.false;
            });

            it('from the bottom', () => {
                firstRect.top = 21;
                expect(rect.intersects(firstRect, secondRect)).to.be.false;
            });
        });
    });

    describe('intersectionWithLine method', () => {
        const rectangle = {};
        const segmentStart = {};
        const segmentEnd = {};
        
        beforeEach(() => {
            rectangle.top = 10;
            rectangle.left = 10;
            rectangle.height = 10;
            rectangle.width = 10;

            segmentStart.top = 0;
            segmentStart.left = 0;
            segmentEnd.top = 15;
            segmentEnd.left = 15;
        });

        it('returns falsy when no intersection exists', () => {
            segmentStart.top = 21;
            segmentStart.left = 9;
            segmentEnd.top = 21;
            segmentEnd.left = 9;

            expect(rect.intersectionWithLine(
                rectangle,
                segmentStart,
                segmentEnd
            )).to.be.undefined;
        });

        describe('returns intersection point', () => {
            it('from the left side', () => {
                segmentStart.top = 15;
                segmentStart.left = 0;

                expect(rect.intersectionWithLine(
                    rectangle,
                    segmentStart,
                    segmentEnd
                )).to.eql({
                    top: 15,
                    left: 10
                });
            });

            it('from the right side', () => {
                segmentStart.top = 15;
                segmentStart.left = 25;

                expect(rect.intersectionWithLine(
                    rectangle,
                    segmentStart,
                    segmentEnd
                )).to.eql({
                    top: 15,
                    left: 20
                });
            });

            it('from the top side', () => {
                segmentStart.top = 0;
                segmentStart.left = 15;

                expect(rect.intersectionWithLine(
                    rectangle,
                    segmentStart,
                    segmentEnd
                )).to.eql({
                    top: 10,
                    left: 15
                });
            });

            it('from the bottom side', () => {
                segmentStart.top = 25;
                segmentStart.left = 15;

                expect(rect.intersectionWithLine(
                    rectangle,
                    segmentStart,
                    segmentEnd
                )).to.eql({
                    top: 20,
                    left: 15
                });
            });
        });
    });

    describe('displace method', () => {
        const stationaryRect = {
            top: 10,
            left: 10,
            width: 10,
            height: 10
        };
        const movableRect = {};

        beforeEach(() => {
            movableRect.top = 10;
            movableRect.left = 10;
            movableRect.height = 10;
            movableRect.width = 10;
        });

        it('displaces the movable rectangle an extra amount if spacing is specified', () => {
            movableRect.top = 19;
            rect.displace(movableRect, stationaryRect, 3);
            expect(movableRect).to.eql({
                top: 26,
                left: 10,
                width: 10,
                height: 10
            });

            movableRect.top = 9;
            rect.displace(movableRect, stationaryRect, 3);
            expect(movableRect).to.eql({
                top: -6,
                left: 10,
                width: 10,
                height: 10
            });
        });

        it('displaces the movable rectangle in the direction with the shortest distance', () => {
            movableRect.top = 11;
            movableRect.left = 12;
            rect.displace(movableRect, stationaryRect);
            expect(movableRect).to.eql({
                top: 11,
                left: 20,
                width: 10,
                height: 10
            });
            
            movableRect.top = 12;
            movableRect.left = 11;
            rect.displace(movableRect, stationaryRect);
            expect(movableRect).to.eql({
                top: 20,
                left: 11,
                width: 10,
                height: 10
            });

            movableRect.top = 1;
            movableRect.left = 2;
            rect.displace(movableRect, stationaryRect);
            expect(movableRect).to.eql({
                top: 0,
                left: 2,
                width: 10,
                height: 10
            });

            movableRect.top = 2;
            movableRect.left = 1;
            rect.displace(movableRect, stationaryRect);
            expect(movableRect).to.eql({
                top: 2,
                left: 0,
                width: 10,
                height: 10
            });
        });

        describe('displaces the movable rectangle', () => {
            it('to the left', () => {
                movableRect.left = 1;
                rect.displace(movableRect, stationaryRect);
                expect(movableRect).to.eql({
                    top: 10,
                    left: 0,
                    width: 10,
                    height: 10
                });
            });

            it('to the right', () => {
                movableRect.left = 19;
                rect.displace(movableRect, stationaryRect);
                expect(movableRect).to.eql({
                    top: 10,
                    left: 20,
                    width: 10,
                    height: 10
                });
            });

            it('to the top', () => {
                movableRect.top = 1;
                rect.displace(movableRect, stationaryRect);
                expect(movableRect).to.eql({
                    top: 0,
                    left: 10,
                    width: 10,
                    height: 10
                });
            });

            it('to the bottom', () => {
                movableRect.top = 19;
                rect.displace(movableRect, stationaryRect);
                expect(movableRect).to.eql({
                    top: 20,
                    left: 10,
                    width: 10,
                    height: 10
                });
            });
        });
    });
});
