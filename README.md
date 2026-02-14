# AI UI Generator – Deterministic Agent

## Architecture
Planner → Generator → Validator → Preview

## Planner
AI decides layout + components using JSON.

## Generator
AI generates JSX using ONLY allowed components.

## Deterministic Enforcement
System restricts AI to:
Navbar, Sidebar, Card, Button, Table, Input.

## Validation
Regex checks for unknown components.
Rejects invalid output.

## Component Library
All UI components stored in /components/ui.

## Preview
JSX rendered inside iframe using Babel.

## Features
- rollback history
- planner stage UI
- deterministic enforcement
- validation
