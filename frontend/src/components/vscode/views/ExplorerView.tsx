/**
 * Explorer View - Vue explorateur de fichiers
 * Style VS Code avec tree view
 */

import React, { useState } from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import {
  Folder,
  FolderOpen,
  InsertDriveFile,
  ExpandMore,
  ChevronRight,
} from '@mui/icons-material';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  expanded?: boolean;
}

const mockFileTree: FileNode[] = [
  {
    name: 'frontend',
    type: 'folder',
    expanded: true,
    children: [
      {
        name: 'src',
        type: 'folder',
        expanded: true,
        children: [
          { name: 'App.tsx', type: 'file' },
          { name: 'index.tsx', type: 'file' },
          {
            name: 'components',
            type: 'folder',
            children: [
              { name: 'Dashboard.tsx', type: 'file' },
              { name: 'Sidebar.tsx', type: 'file' },
            ],
          },
        ],
      },
      { name: 'package.json', type: 'file' },
      { name: 'tsconfig.json', type: 'file' },
    ],
  },
  {
    name: 'backend',
    type: 'folder',
    children: [
      {
        name: 'cmd',
        type: 'folder',
        children: [
          {
            name: 'server',
            type: 'folder',
            children: [{ name: 'main.go', type: 'file' }],
          },
        ],
      },
      { name: 'go.mod', type: 'file' },
      { name: 'go.sum', type: 'file' },
    ],
  },
  {
    name: 'docker-compose.yml',
    type: 'file',
  },
  {
    name: 'README.md',
    type: 'file',
  },
];

interface FileTreeItemProps {
  node: FileNode;
  level: number;
  onToggle: (path: string) => void;
  path: string;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ node, level, onToggle, path }) => {
  const currentPath = `${path}/${node.name}`;
  const [isExpanded, setIsExpanded] = useState(node.expanded || false);

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
      onToggle(currentPath);
    } else {
      console.log('Open file:', currentPath);
    }
  };

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: 22,
          pl: level * 1.5 + 0.5,
          cursor: 'pointer',
          color: '#cccccc',
          fontSize: '13px',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        {node.type === 'folder' && (
          <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
            {isExpanded ? (
              <ExpandMore sx={{ fontSize: 16 }} />
            ) : (
              <ChevronRight sx={{ fontSize: 16 }} />
            )}
          </Box>
        )}
        {node.type === 'folder' ? (
          isExpanded ? (
            <FolderOpen sx={{ fontSize: 16, mr: 0.5, color: '#dcb67a' }} />
          ) : (
            <Folder sx={{ fontSize: 16, mr: 0.5, color: '#dcb67a' }} />
          )
        ) : (
          <InsertDriveFile sx={{ fontSize: 16, mr: 0.5, color: '#858585' }} />
        )}
        <Typography variant="caption" sx={{ fontSize: '13px' }}>
          {node.name}
        </Typography>
      </Box>

      {node.type === 'folder' && node.children && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          {node.children.map((child, index) => (
            <FileTreeItem
              key={`${currentPath}/${child.name}-${index}`}
              node={child}
              level={level + 1}
              onToggle={onToggle}
              path={currentPath}
            />
          ))}
        </Collapse>
      )}
    </>
  );
};

export const ExplorerView: React.FC = () => {
  const handleToggle = (path: string) => {
    console.log('Toggle folder:', path);
  };

  return (
    <Box sx={{ py: 1 }}>
      {/* Section Header */}
      <Box
        sx={{
          px: 2,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: '#cccccc',
            fontWeight: 600,
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Unity-IDE
        </Typography>
      </Box>

      {/* File Tree */}
      <Box>
        {mockFileTree.map((node, index) => (
          <FileTreeItem
            key={`${node.name}-${index}`}
            node={node}
            level={0}
            onToggle={handleToggle}
            path=""
          />
        ))}
      </Box>
    </Box>
  );
};

export default ExplorerView;
