'use client';

import { Pagination, Radio, RadioChangeEvent, Tabs, TabsProps } from 'antd';
import ELK from 'elkjs/lib/elk.bundled.js';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import ReactFlow, {
  addEdge,
  Panel,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'reactflow';

import 'reactflow/dist/style.css';

import { initialEdges, initialNodes } from './nodes-edges.js';

const elk = new ELK();

// Elk has a *huge* amount of options to configure. To see everything you can
// tweak check out:
//
// - https://www.eclipse.org/elk/reference/algorithms.html
// - https://www.eclipse.org/elk/reference/options.html
const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
};

const getLayoutedElements = (nodes, edges, options = {}) => {
  const isHorizontal = options?.['elk.direction'] === 'RIGHT';
  const graph = {
    id: 'root',
    layoutOptions: options,
    children: nodes.map((node) => ({
      ...node,
      // Adjust the target and source handle positions based on the layout
      // direction.
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',

      // Hardcode a width and height for elk to use when layouting.
      width: 150,
      height: 50,
    })),
    edges: edges,
  };

  return elk
    .layout(graph)
    .then((layoutedGraph) => ({
      nodes: layoutedGraph.children.map((node) => ({
        ...node,
        // React Flow expects a position property on the node instead of `x`
        // and `y` fields.
        position: { x: node.x, y: node.y },
      })),

      edges: layoutedGraph.edges,
    }))
    .catch(console.error);
};

function LayoutFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );
  const onLayout = useCallback(
    ({ direction = 'RIGHT', useInitialNodes = false }) => {
      const opts = { 'elk.direction': direction, ...elkOptions };
      const ns = useInitialNodes ? initialNodes : nodes;
      const es = useInitialNodes ? initialEdges : edges;

      getLayoutedElements(ns, es, opts).then(
        ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);

          window.requestAnimationFrame(() => fitView());
        }
      );
    },
    [nodes, edges]
  );

  // Calculate the initial layout on mount.
  useLayoutEffect(() => {
    onLayout({ direction: 'DOWN', useInitialNodes: true });
  }, []);
  const [value4, setValue4] = useState('Apple');
  const optionsWithDisabled = [
    { label: 'Diagram View', value: 'Apple' },
    { label: 'Table View', value: 'Orange' },
  ];
  const onChange4 = ({ target: { value } }: RadioChangeEvent) => {
    console.log('radio4 checked', value);
    setValue4(value);
  };
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onConnect={onConnect}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
    >
      <Panel position='top-right'>
        <Radio.Group
          options={optionsWithDisabled}
          onChange={onChange4}
          value={value4}
          optionType='button'
          buttonStyle='solid'
        />
      </Panel>
    </ReactFlow>
  );
}

export default function GraphPage() {
  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Concise',
      children: 'Content of Tab Pane 1',
    },
    {
      key: '2',
      label: 'Normal(5 credits)',
      children: 'Content of Tab Pane 2',
    },
    {
      key: '3',
      label: 'Detail(10 credits)',
      children: 'Content of Tab Pane 3',
    },
  ];
  return (
    <main>
      <section>
        <h4>
          Responsible Artificial Intelligence: Designing AI For Human Values
        </h4>
        <Tabs defaultActiveKey='1' items={items} onChange={onChange} />
        <div style={{ height: '400px' }}>
          <ReactFlowProvider>
            <LayoutFlow />
          </ReactFlowProvider>
        </div>
        <Pagination defaultCurrent={1} total={50} />
      </section>
    </main>
  );
}
