# Animation, Forms, Navigation & Charts

## Animation (MEDIUM)

- **Duration**: 150-300ms for micro-interactions; complex transitions <=400ms
- **Transform performance**: transform/opacity only; never animate width/height/top/left
- **Loading states**: Skeleton or progress indicator when loading exceeds 300ms
- **Easing**: ease-out entering, ease-in exiting
- **Motion meaning**: Every animation expresses cause-effect

## Forms & Feedback (MEDIUM)

- **Input labels**: Visible label per input (not placeholder-only)
- **Error placement**: Below the related field
- **Submit feedback**: Loading then success/error state
- **Required indicators**: Mark required fields
- **Empty states**: Helpful message and action when no content
- **Toast dismiss**: Auto-dismiss in 3-5s
- **Confirmation dialogs**: Confirm before destructive actions
- **Inline validation**: Validate on blur (not keystroke)
- **Input type keyboard**: Semantic input types trigger correct mobile keyboard

## Navigation Patterns (HIGH)

- **Bottom nav limit**: Max 5 items; labels with icons
- **Drawer usage**: Drawer/sidebar for secondary navigation, not primary actions
- **Back behavior**: Predictable and consistent
- **Deep linking**: All key screens reachable via deep link / URL
- **Modal escape**: Modals/sheets offer clear close/dismiss affordance
- **Search accessible**: Easily reachable
- **State preservation**: Back restores scroll position, filter state, input

## Charts & Data (LOW)

- **Chart type**: Match to data type (trend -> line, comparison -> bar, proportion -> pie/donut)
- **Color guidance**: Accessible palettes; avoid red/green only pairs (colorblind users)
- **Data table**: Provide table alternative for accessibility
- **Legend visible**: Always show; position near chart
- **Tooltip on interact**: Hover (Web) or tap (mobile)
- **Axis labels**: Units and readable scale
- **Responsive chart**: Reflow or simplify on small screens
- **Empty data state**: Meaningful empty state when no data exists
