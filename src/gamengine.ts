
import { TileBase } from "./logic/map/common.notest";
import { ActionBase } from "./logic/units/actions/action";
import { UnitPosition, UnitPositions } from "./logic/units/positions";
import { SpecsBase, UnitBase } from "./logic/units/unit";
import { Events } from "./util/eventDictionary.notest";
import { EventEmitter } from "./util/events.notest";

export { MapSquare, MapHexOddQ } from "./logic/map/map";
export { CostCalculatorConst, CostCalculatorTerrain } from "./logic/map/costs"

export {Playground, PlaygroundInteractions, PlaygroundThreeJs, PlaygroundView, PlaygroundViewDefault, PlaygroundViewHudThreeJs, PlaygroundViewHudThreeJsDefault, PlaygroundViewMainThreeJs, PlaygroundViewMainThreeJsDefault, PlaygroundViewThreeJS} from "./gui/playground/playground"

export {RenderablesFactory, RenderablesThreeJSFactory} from './gui/renderer/renderables-factory';
export type {Renderable, RenderableThreeJS} from './gui/renderer/renderables-factory';

export {HudComponent, HudComponentLargeThreeJs, HudComponentMapNavigationThreeJs, HudComponentThreeJs, HudRenderer, HudRendererThreeJs, MapRenderer, MapRendererThreeJs, Renderer, SpriteFactory, SpriteFactoryx128x128x4xL,MapQuadRendererThreeJs} from './gui/renderer/renderers'
export type {Rotations, ScenePosition} from './gui/renderer/renderers'

export type {MatchingThreeJs, PlaygroundInteractionEvent, PlaygroundView3D, PlaygroundViewHud, PlaygroundViewMain, SizingHudThreeJs} from "./gui/playground/playground"


export {Events} from './util/eventDictionary.notest'

export interface BattleActor {
  unit: UnitBase,
  damage: {
    inflicted: number,
    taken: number,
    casualty: boolean
  }
}

export interface BattleOutcome {
  attacker: BattleActor,
  defender: BattleActor,
  casualties: boolean

}

export class Gamengine {
  emitter: EventEmitter;
  positions: UnitPositions;

  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
    this.positions = new UnitPositions();
  }

  _bindGameEvents() {
    this.emitter.on(Events.MAP.FOV, this._onMapFov.bind(this));
    this.emitter.on(Events.UNIT.BATTLE, this._onUnitBattle.bind(this));
    this.emitter.on(Events.UNIT.CONSUME_AP, this._onUnitConsumeAp.bind(this));
    this.emitter.on(Events.UNIT.POSITION, this._onUnitPosition.bind(this));
    this.emitter.on(Events.UNIT.RUNNER_ACTION, this._onUnitRunnerAction.bind(this));
  }

  _onMapFov() {
  }
  _onUnitBattle(attacker: SpecsBase, target: SpecsBase, targetTile: TileBase) {

    const attackerPosition: UnitPosition = this.positions.get(attacker.uid);
    const targetPosition: UnitPosition = this.positions.get(target.uid);

    var battleOutcome = this.battle(attackerPosition.unit, targetPosition.unit, 4, 4);

    if(battleOutcome.casualties && battleOutcome.defender.damage.casualty){
      // in case defender is dead then attacker takes it's position      
      this.emitter.emit(Events.UNIT.POSITION,battleOutcome.attacker.unit, targetTile)
    }

    this.emitter.emit(Events.ENGINE.BATTLE_OUTCOME, battleOutcome);

  }
  _onUnitConsumeAp(unit: SpecsBase, howMuch: number) {
    const unitPosition: UnitPosition = this.positions.get(unit.uid);
    unitPosition.unit.actionPoints -= howMuch;
    if (unitPosition.unit.actionPoints < 0)
      throw new Error(`Negative action points ${unit.uid}`);
  }
  _onUnitPosition(unit: SpecsBase, whereTo: TileBase) {
    const unitPosition: UnitPosition = this.positions.get(unit.uid);
    this.positions.set(unitPosition.unit, whereTo);
  }
  _onUnitRunnerAction(unit: SpecsBase, action: ActionBase) {
    const unitPosition = this.positions.get(unit.uid);
    unitPosition.unit.actionRunner = action;
  }

  battle(attackUnit: UnitBase, defendUnit: UnitBase, baseDamage: number, baseDamageSpread: number):BattleOutcome {

    var attackStrength = attackUnit.attackStrength(defendUnit);
		var defendStrength = defendUnit.defendStrength(attackUnit);

		var strongerUnit = (attackStrength>defendStrength)?attackUnit:defendUnit;
		var strongerUnitStrength = (attackStrength>defendStrength)?attackStrength:defendStrength;

		var weakerUnit = (attackStrength<=defendStrength)?attackUnit:defendUnit;
		var weakerUnitStrength = (attackStrength<=defendStrength)?attackStrength:defendStrength;

		var r = Math.max(attackStrength,defendStrength)/Math.min(attackStrength,defendStrength);
		var m = 0.5+Math.pow(r+3,4)/512;		

		var minDmgToStrongerUnit = baseDamage/m;
		var minDmgToWeakerUnit = baseDamage*m;

		var dmgSpreadToStrongerUnit = baseDamageSpread/m;
		var dmgSpreadToWeakerUnit = baseDamageSpread*m;

		var damageToStrongerUnit = Math.max(Math.floor(minDmgToStrongerUnit+this._generateRandom(0,dmgSpreadToStrongerUnit)),1);
		var damageToWeakerUnit = Math.max(Math.floor(minDmgToWeakerUnit+this._generateRandom(0,dmgSpreadToWeakerUnit)),1);

		strongerUnit.hitPoints = Math.max(strongerUnit.hitPoints-damageToStrongerUnit,0);
		weakerUnit.hitPoints = Math.max(weakerUnit.hitPoints-damageToWeakerUnit,0);

		strongerUnit.gainBattleExperience(weakerUnitStrength,damageToWeakerUnit,damageToStrongerUnit);
		weakerUnit.gainBattleExperience(strongerUnitStrength,damageToStrongerUnit,damageToWeakerUnit);

    // in case both units have 0 hit points the unit that took most damage is killed
		if(strongerUnit.hitPoints==0&&weakerUnit.hitPoints==0){
			if(damageToWeakerUnit>damageToStrongerUnit){
				strongerUnit.hitPoints = 1;				
			}else{
				weakerUnit.hitPoints = 1;
			}
		}

    let result:BattleOutcome = {
      attacker: {
        damage: {
          casualty: false,
          inflicted: (attackUnit == strongerUnit)?damageToWeakerUnit:damageToStrongerUnit,
          taken: (attackUnit == strongerUnit)?damageToStrongerUnit:damageToWeakerUnit
        },
        unit: attackUnit
      },
      defender: {
        damage: {
          casualty: false,
          inflicted: (defendUnit == strongerUnit)?damageToWeakerUnit:damageToStrongerUnit,
          taken: (defendUnit == strongerUnit)?damageToStrongerUnit:damageToWeakerUnit
        },
        unit: defendUnit
      },
      casualties: false     
    }

    if(attackUnit.hitPoints==0){ 			
			// var gameEvent = new UnitEvent(strongerUnit,"DIE",this.engineParams.company);
			// this.publishEvent(gameEvent);

			result.attacker.damage.casualty = true;
      result.casualties = true;
		};
		if(defendUnit.hitPoints==0){
			//this.uiUnitDie(weakerUnit);
			// var gameEvent = new UnitEvent(weakerUnit,"DIE",this.engineParams.company);
			// this.publishEvent(gameEvent);

			result.defender.damage.casualty = true
      result.casualties = true;
		};
    return result;
  }

  _generateRandom(min:number, max:number):number{
		var random = Math.random() * (max - min) + min;
		return random;
	}







  // move(unit)
  // action(unit)

  // action (to, action)

  // {}
  // actions
  // move 
  // range attack
  // melee attack
  // make group/disable group
  // embark/disembark
  // fortify
  // heal

  // action -> cost calculator assigned to unit instance/unit type

  // action
  // --> range 



  // action points

  // unit

  // action cost calculator


  //  gameengine

  // 1. when action is selected - draw range
  //  2. eventual  show paths when hovering over tiles within range
  // 3. when actiom is performed - consume action points and/or according to path cost
  //  4. eventual change position according to path
}

