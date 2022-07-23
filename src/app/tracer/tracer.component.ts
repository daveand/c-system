import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Circle, Color, Container, Rect, Svg, SVG } from '@svgdotjs/svg.js';
import '@svgdotjs/svg.draggable.js';
import { WorkspaceModel } from '../models/workspacemodel';
import { fromEvent, Observable } from 'rxjs';
import { compileNgModule } from '@angular/compiler';
import { G } from '@svgdotjs/svg.js';
import { Line } from '@svgdotjs/svg.js';
import { CanalPathModel } from '../models/canalpathmodel';
import { NodeModel } from '../models/nodemodel';

@Component({
  selector: 'app-tracer',
  templateUrl: './tracer.component.html',
  styleUrls: ['./tracer.component.css']
})
export class TracerComponent implements OnInit, AfterViewInit {

  constructor() { 

  }  
  
  componentList: G[] = [];
  canals: Rect[] = [];
  canalPaths: Line[] = [];
  traceCanalPaths: CanalPathModel[] = [];
  cablePath: number[] = [];

  clickObservable: Observable<Event> = fromEvent(document,'click');
  hoverObservable: Observable<Event> = fromEvent(document, 'mouseover');
  hoverOffObservable: Observable<Event> = fromEvent(document, 'mouseout');

  workspaceOffset = 50;
  workspace: Svg = SVG();

  workspaceModel: WorkspaceModel = new WorkspaceModel(1, 600, 800);
  plateGroup: any;

  positionX: any;
  positionY: any;
  componentId: any;
  newCanalId: number = 1001;
  newComponentId: number = 1;
  newNodeId: number = 1;
  name: string | undefined;
  componentWidth = 40;
  componentHeight = 80;
  componentName = "F01";
  canalWidth = 600;
  canalHeight = 40;

  fromPoint: number[] = [];
  toPoint: number[] = [];
  fromNode: number[] = [];
  toNode: number[] = [];
  fromPointSelected: boolean = false;
  toPointSelected: boolean = false;
  fromPointIsTop: boolean = false;
  toPointIsTop: boolean = false;
  traceStartNode: number[] = [];
  traceGoalNode: number[] = [];
  traceNodeList: NodeModel[] = [];

  grid: G = new G;
  showGrid: boolean = true;
  deleteActive: boolean = false;
  
  ngOnInit(): void {
    this.workspace = SVG().addTo('#workspace').size(1200, 1200);
    this.subscribeToObservable();
  } 
  
  ngAfterViewInit(): void {
  }

  addCanal(): void {
    var part1 = this.workspace.rect(this.canalWidth, this.canalHeight).attr({ fill: '#FFF', stroke: '#000', 'stroke-width': 2 }).move(0 + this.workspaceOffset, 0 + this.workspaceOffset); 
    part1.attr({'id': this.newCanalId});


    part1.draggable();
    this.canals.push(part1);

    console.log(this.canals);
    

    this.newCanalId++;   
  }

  drawCanalPaths() {
    this.canalPaths.forEach(canal => {
      canal.remove();
    });
    this.canalPaths = [];
    this.traceCanalPaths = [];

    this.canals.forEach(canal => {
      //console.log(canal);
      var canalWidth = parseInt(canal.node.getAttribute('width')!);
      var canalHeight = parseInt(canal.node.getAttribute('height')!);
      var canalPosX = parseInt(canal.node.getAttribute('x')!);
      var canalPosY = parseInt(canal.node.getAttribute('y')!);

      // console.log(canalWidth);
      // console.log(canalHeight);
      // console.log(canalPosX);
      // console.log(canalPosY);

      var canalPath;

      if(canalWidth > canalHeight) {
        canalPath = this.workspace.line(0, 0, canalWidth, 0).move(canalPosX, canalPosY + (canalHeight / 2));
        canalPath.stroke({ color: 'gray', width: 2});
        //canalPath.hide();
        this.canalPaths.push(canalPath);

        var pathArray = [];
        for (let i = canalPosX; i < canalPosX + canalWidth; i = i + 10) {
          pathArray.push(i);      
        }

        var model: CanalPathModel = {id: parseInt(canal.node.id), vertical: false, x: pathArray, y: [canalPosY + (canalHeight / 2)]};
        this.traceCanalPaths.push(model);
      } else {
        canalPath = this.workspace.line(0, 0, 0, canalHeight).move(canalPosX + (canalWidth / 2), canalPosY);
        canalPath.stroke({ color: 'gray', width: 2});
        //canalPath.hide();
        this.canalPaths.push(canalPath);
        
        var pathArray = [];
        for (let i = canalPosY; i < canalPosY + canalHeight; i = i + 10) {
          pathArray.push(i);      
        }

        var model: CanalPathModel = {id: parseInt(canal.node.id), vertical: true, x: [canalPosX + (canalWidth / 2)], y: pathArray};
        this.traceCanalPaths.push(model);
      }

      //console.log(this.canalPaths);
      console.log(this.traceCanalPaths);
      
      
    });
  }

  yDistanceFrom = 10000;
  xPosFrom = 0;
  yPosFrom = 0;
  yDistanceTo = 10000;
  xPosTo = 0;
  yPosTo = 0;
  
  drawCanalNodes() {
    if (this.fromPoint.length > 0 && this.toPoint.length > 0) {

      this.cablePath = [];
      this.newNodeId = 1;
  
      for (let i = 0; i < this.traceCanalPaths.length; i++) {
        if(this.traceCanalPaths[i].vertical == false) {
          var hCanal = this.traceCanalPaths[i];
  
          for (let j = 0; j < this.traceCanalPaths.length; j++) {
            if (this.traceCanalPaths[j].vertical == true) {
              var vCanal = this.traceCanalPaths[j];
              
              for (let k = 0; k < vCanal.y.length; k++) {
                if (vCanal.y[k] == hCanal.y[0]) {
                  if (hCanal.x.find(x => x == vCanal.x[0])) {
                    var posX = hCanal.x.find(x => x == vCanal.x[0]);
                    this.workspace.circle(10).attr({fill: '#FFF', stroke: 'red', 'stroke-width': 2}).move(posX! - 5, vCanal.y[k] - 5);
                    var nodeLabel = this.workspace.text(this.newNodeId.toString()).move(posX! + 5, vCanal.y[k] + 5);
                    nodeLabel.stroke({ color: 'gray', width: 1});
                    this.traceNodeList.push({id: this.newNodeId, isVisited: false, x: posX!, y: vCanal.y[k]});
                    this.newNodeId++;
                  }
                }                            
              }
            }         
          }
  
          for (let l = 0; l < hCanal.x.length; l++) {
            if (hCanal.x[l] == this.fromPoint[0] && this.fromPointIsTop) {
              if (hCanal.y[0] < this.fromPoint[1] && (this.fromPoint[1] - hCanal.y[0]) < this.yDistanceFrom) {
                console.log(this.yDistanceFrom);
                
                this.xPosFrom = hCanal.x[l];
                this.yPosFrom = hCanal.y[0];
                this.yDistanceFrom = this.fromPoint[1] - hCanal.y[0];
              }
            }
            if (hCanal.x[l] == this.fromPoint[0] && !this.fromPointIsTop) {
              if (hCanal.y[0] > this.fromPoint[1] && (this.fromPoint[1] - hCanal.y[0]) < this.yDistanceFrom) {
                console.log(this.yDistanceFrom);
                
                this.xPosFrom = hCanal.x[l];
                this.yPosFrom = hCanal.y[0];
                this.yDistanceFrom = this.fromPoint[1] - hCanal.y[0];
              }
            }
            if (hCanal.x[l] == this.toPoint[0] && this.toPointIsTop) {
              if (hCanal.y[0] < this.toPoint[1] && (this.toPoint[1] - hCanal.y[0]) < this.yDistanceTo) {
                console.log(this.yDistanceTo);
                
                this.xPosTo = hCanal.x[l];
                this.yPosTo = hCanal.y[0];
                this.yDistanceTo = this.toPoint[1] - hCanal.y[0];
              }
            }
            if (hCanal.x[l] == this.toPoint[0] && !this.toPointIsTop) {
              if (hCanal.y[0] > this.toPoint[1] && (this.toPoint[1] - hCanal.y[0]) < this.yDistanceTo) {
                console.log(this.yDistanceTo);
                
                this.xPosTo = hCanal.x[l];
                this.yPosTo = hCanal.y[0];
                this.yDistanceTo = this.toPoint[1] - hCanal.y[0];
              }
            }         
       
          }
      
          
        }  
      }  
  
      this.workspace.circle(10).attr({fill: '#FFF', stroke: 'red', 'stroke-width': 2}).move(this.xPosFrom - 5, this.yPosFrom - 5);
      this.fromNode = [this.xPosFrom, this.yPosFrom];
      if (this.fromPointIsTop) {
        var fromLine = this.workspace.line(this.fromPoint[0], this.fromPoint[1], this.fromNode[0], this.fromNode[1]).move(this.xPosFrom, this.yPosFrom);
        this.cablePath.push(this.fromPoint[1] - this.fromNode[1]);
      }
      else {
        var fromLine = this.workspace.line(this.fromPoint[0], this.fromPoint[1], this.fromNode[0], this.fromNode[1]).move(this.xPosFrom, this.fromPoint[1]);
        this.cablePath.push(this.fromNode[1] - this.fromPoint[1]);
      }
      fromLine.stroke({ color: 'gray', width: 2});
      
      this.workspace.circle(10).attr({fill: '#FFF', stroke: 'red', 'stroke-width': 2}).move(this.xPosTo - 5, this.yPosTo - 5);
      this.toNode = [this.xPosTo, this.yPosTo];
      if (this.toPointIsTop) {
        var toLine = this.workspace.line(this.toPoint[0], this.toPoint[1], this.toNode[0], this.toNode[1]).move(this.xPosTo, this.yPosTo);
        this.cablePath.push(this.toPoint[1] - this.toNode[1]);
      }
      else {
        var toLine = this.workspace.line(this.toPoint[0], this.toPoint[1], this.toNode[0], this.toNode[1]).move(this.xPosTo, this.toPoint[1]);
        this.cablePath.push(this.toNode[1] - this.toPoint[1]);
      }
      toLine.stroke({ color: 'gray', width: 2});
      
      this.traceStartNode = [this.xPosFrom, this.yPosFrom];
      this.traceGoalNode = [this.xPosTo, this.yPosTo];
  
      console.log(this.traceStartNode);
      console.log(this.traceNodeList);
      console.log(this.traceGoalNode);
    }
    
    

  }

  goRight: boolean = true;

  trace() {

    this.drawCanalPaths();
    this.drawCanalNodes();

    var trace: NodeModel[] = [];
    var traces: NodeModel[][] = [[]];

    




    console.log(trace);
    

  }



  addComponent(): void {

    var component: G;
    
    var part1 = this.workspace.rect(this.componentWidth, this.componentHeight).attr({ fill: '#FFF', stroke: '#000', 'stroke-width': 2 }).move(0 + this.workspaceOffset, 0 + this.workspaceOffset); 
    // var part2 = this.workspace.rect(50, 50).attr({ fill: '#FFF', stroke: '#000', 'stroke-width': 2 }).move(0 + this.workspaceOffset, 0 + this.workspaceOffset); 
    part1.attr({'id': this.newComponentId});
    // part2.attr({'id': this.newComponentId});
    var name = this.workspace.text(this.componentName).move(5 + this.workspaceOffset, (this.componentHeight / 2) - 10 + this.workspaceOffset);
    name.stroke({ color: 'black', width: 1}).rotate(0);
    name.attr({ 'id': this.newComponentId, 'pointer-events': 'none'});

    var pointTop = this.workspace.circle(10).attr({fill: '#FFF', stroke: '#000', 'stroke-width': 2}).move((this.componentWidth / 2) - 5 + this.workspaceOffset, -5 + this.workspaceOffset);
    var pointBottom = this.workspace.circle(10).attr({fill: '#FFF', stroke: '#000', 'stroke-width': 2}).move((this.componentWidth / 2) - 5 + this.workspaceOffset, (this.componentHeight -5) + this.workspaceOffset);
    pointTop.attr({'id': `${this.newComponentId}-top`});
    pointBottom.attr({'id': `${this.newComponentId}-bottom`});

    var component = this.workspace.group();
    component.attr({'id': this.newComponentId});
    component.add(part1);
    // component.add(part2);
    component.add(name);
    component.add(pointTop);
    component.add(pointBottom);
    component.move(200, 250);
    component.draggable();

    this.componentList.push(component);
    this.newComponentId++;

    // console.log(this.componentList);
    // console.log(this.name);
    
  }
  


  private subscribeToObservable() {
    this.clickObservable.subscribe(event => { 
      // console.log(event);
      //console.log((event.target as HTMLInputElement).id);
      this.componentId = parseInt((event.target as HTMLInputElement).id);

      if (this.componentId > 1000) {
        //console.log('canal!');
        var canalToEdit: Rect = this.canals.find(c => c.node.id == this.componentId)!;
        //console.log(canalToEdit);
        this.positionX = canalToEdit.cx() - (parseInt(canalToEdit.node.attributes[0].value) / 2);
        this.positionY = canalToEdit.cy() - (parseInt(canalToEdit.node.attributes[1].value) / 2);
        if (this.deleteActive) {     
          console.log(this.canals);
          console.log(canalToEdit.node.id);
          
          
          canalToEdit.remove();
          this.canals = this.canals.filter(c => c.node.id != canalToEdit.node.id);
          this.deleteActive = false;

          console.log(this.canals);
          
        }
        else {
          canalToEdit.move(this.roundToNearest10(this.positionX), this.roundToNearest10(this.positionY));
        }

      }
      
      if(this.componentList.find(c => c.node.id == this.componentId) != null) {
        var componentToEdit: G = this.componentList.find(c => c.node.id == this.componentId)!;
        //console.log(componentToEdit);

        this.positionX = componentToEdit.cx() - (parseInt(componentToEdit.node.children[0].attributes[0].value) / 2);
        this.positionY = componentToEdit.cy() - (parseInt(componentToEdit.node.children[0].attributes[1].value) / 2) - 5;
        if (this.deleteActive) {
          componentToEdit.remove();
          this.deleteActive = false;
        }
        else {
          componentToEdit.move(this.roundToNearest10(this.positionX), this.roundToNearest10(this.positionY) - 5);
        }

      }

      if ((event.target as HTMLInputElement).id.includes('top') || (event.target as HTMLInputElement).id.includes('bottom')){
        if(!this.fromPointSelected) {
          this.fromPoint = this.getPointPosition(event.target as HTMLInputElement);
          this.fromPointSelected = true;
          this.fromPointIsTop = this.getPointIsTop((event.target as HTMLInputElement).id);
          
        }
        else if(this.fromPointSelected) {
          this.toPoint = this.getPointPosition(event.target as HTMLInputElement);
          this.fromPointSelected = false;
          this.toPointSelected = true;
          this.toPointIsTop = this.getPointIsTop((event.target as HTMLInputElement).id);
        }

        console.log(this.fromPoint);
        console.log(this.toPoint);
  
      } 
      
      // if (this.deleteActive) {
      //   (event.target as HTMLInputElement).remove();
      //   this.deleteActive = false;
      // }

    });

    this.hoverObservable.subscribe(event => {  
      this.highlightPoint(event, false);  
    });

    this.hoverOffObservable.subscribe(event => {    
      this.highlightPoint(event, true);
    })
  }

  getPointPosition(element: HTMLInputElement): number[] {
    var position: number[] = [];

    position[0] = parseInt(element.getAttribute('cx')!);
    position[1] = parseInt(element.getAttribute('cy')!);

    return position;
  }

  getPointIsTop(id: string): boolean {
    if(id.includes('top')) {
      return true;
    }
    else {
      return false;
    }
  }

  highlightPoint(event: Event, state: boolean, ){
    if ((event.target as HTMLInputElement).id.includes('top') || (event.target as HTMLInputElement).id.includes('bottom')){
      if(this.componentList.find(c => c.node.id == (event.target as HTMLInputElement).parentElement?.id) != null) {
        var componentToEdit: G = this.componentList.find(c => c.node.id == (event.target as HTMLInputElement).parentElement?.id)!;
        if (!state) {
          (event.target as HTMLInputElement).setAttribute('fill', 'gray');
          componentToEdit.draggable(state);
        } else {
          (event.target as HTMLInputElement).setAttribute('fill', '#FFF');
          componentToEdit.draggable(state);         
        }
      }
    } 

  }

  drawWorkspace(){
    // this.workspaceModel.width = 800;
    // this.workspaceModel.height = 1000;
    
    this.workspace.rect(this.workspaceModel.width, this.workspaceModel.height).attr({ fill: '#FFF', stroke: '#000', 'stroke-width': 2 }).move(this.workspaceOffset, this.workspaceOffset);
    
    this.drawWorkspaceDimensions();
    if(this.showGrid) {
      this.drawGrid();
    }
  }

  toggleGrid() {
    if(this.showGrid) {
      this.grid.hide();
      this.showGrid = false;
    }
    else {
      this.grid.show();
      this.showGrid = true;
    }
  }
  
  toggleDelete() {
    this.deleteActive = true;
 }

  drawWorkspaceDimensions(){
    var plateWidth = this.workspaceModel.width;
    var plateHeight = this.workspaceModel.height;

    var widthLine = this.workspace.line(0, 0, plateWidth - 10, 0).move(55, 30);
    widthLine.stroke({ color: 'gray', width: 2});
    var widthLine2 = this.workspace.line(0, 0, 0, 20).move(50, 20);
    widthLine2.stroke({ color: 'gray', width: 2});
    var widthLine3 = this.workspace.line(0, 0, 0, 20).move(50 + plateWidth, 20);
    widthLine3.stroke({ color: 'gray', width: 2});

    var widthLabel = this.workspace.text(plateWidth.toString()).move(plateWidth / 2 + 50, 10);
    widthLabel.stroke({ color: 'gray', width: 1});

    var heightLine = this.workspace.line(0, 0, 0, plateHeight - 10).move(30, 55);
    heightLine.stroke({ color: 'gray', width: 2});
    var heightLine2 = this.workspace.line(0, 0, 20, 0).move(20, 50);
    heightLine2.stroke({ color: 'gray', width: 2});
    var heightLine3 = this.workspace.line(0, 0, 20, 0).move(20, 50 + plateHeight);
    heightLine3.stroke({ color: 'gray', width: 2});

    var heightLabel = this.workspace.text(plateHeight.toString()).move(0, plateHeight / 2 + 50);
    heightLabel.stroke({ color: 'gray', width: 1}).rotate(270);
  }

  drawGrid() {
    this.grid = this.workspace.group();
    for (let i = 0; i < this.workspaceModel.height - 10; i = i + 10) {
      for (let j = 0; j < this.workspaceModel.width - 10; j = j + 10) {
        var point = this.workspace.circle(0.2).attr({fill: '#FFF', stroke: 'gray', 'stroke-width': 2}).move( j + 10 + (this.workspaceOffset - 0.1), i + 10 + (this.workspaceOffset - 0.1));
        this.grid.add(point);
      }
      
    }
  }

  roundToNearest10(num: number) {
    return Math.ceil(num / 10) * 10;
  }

}
