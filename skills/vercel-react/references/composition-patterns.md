# Composition Patterns

## 1. Component Architecture (HIGH)

### Avoid Boolean Prop Proliferation
```tsx
// ❌ Boolean props create exponential complexity
function Composer({ isThread, isDMThread, isEditing, isForwarding }) { }

// ✅ Explicit variants with composition
function ThreadComposer({ channelId }) { }
function EditComposer() { }
function ForwardMessageComposer() { }
```

### Use Compound Components
```tsx
// Shared context, not props
const ComposerContext = createContext<ComposerContextValue | null>(null)

function ComposerProvider({ children, state, actions, meta }) {
  return <ComposerContext value={{ state, actions, meta }}>{children}</ComposerContext>
}

// UI components compose what they need
<Composer.Provider state={state} actions={actions} meta={meta}>
  <Composer.Frame>
    <Composer.Header />
    <Composer.Input />
    <Composer.Footer>
      <Composer.Formatting />
      <Composer.Submit />
    </Composer.Footer>
  </Composer.Frame>
</Composer.Provider>
```

## 2. State Management (MEDIUM)

### Decouple State from UI
```tsx
// Provider handles state implementation
function ChannelProvider({ channelId, children }) {
  const { state, update, submit } = useGlobalChannel(channelId)
  return (
    <Composer.Provider state={state} actions={{ update, submit }}>
      {children}
    </Composer.Provider>
  )
}

// UI only knows context interface
function ChannelComposer() {
  return <Composer.Frame>...</Composer.Frame>
}
```

### Generic Context Interface (Dependency Injection)
```tsx
interface ComposerState { input: string; attachments: Attachment[] }
interface ComposerActions { update: (s) => void; submit: () => void }
interface ComposerMeta { inputRef: React.RefObject<TextInput> }
interface ComposerContextValue { state: ComposerState; actions: ComposerActions; meta: ComposerMeta }

const ComposerContext = createContext<ComposerContextValue | null>(null)
```

### Lift State to Provider
```tsx
function ForwardMessageProvider({ children }) {
  const [state, setState] = useState(initialState)
  return (
    <Composer.Provider state={state} actions={{ update: setState, submit: forwardMessage }}>
      {children}
    </Composer.Provider>
  )
}

// Custom components OUTSIDE composer can access state
function ForwardButton() {
  const { actions: { submit } } = use(ComposerContext)
  return <Button onPress={submit}>Forward</Button>
}
```

## 3. Implementation Patterns (MEDIUM)

### Create Explicit Variants
```tsx
function ThreadComposer({ channelId }) {
  return (
    <ThreadProvider channelId={channelId}>
      <Composer.Frame>
        <Composer.Input />
        <AlsoSendToChannelField channelId={channelId} />
        <Composer.Footer>...</Composer.Footer>
      </Composer.Frame>
    </ThreadProvider>
  )
}
```

### Prefer Children Over Render Props
```tsx
// ✅ Children - flexible, readable
<Composer.Frame>
  <CustomHeader />
  <Composer.Input />
  <Composer.Footer>
    <Composer.Formatting />
    <Composer.Submit />
  </Composer.Footer>
</Composer.Frame>

// ❌ Render props - awkward, inflexible
<Composer renderHeader={() => <CustomHeader />} renderFooter={...} />
```

## 4. React 19 APIs (MEDIUM)

```tsx
// ❌ forwardRef not needed in React 19
const ComposerInput = forwardRef((props, ref) => <TextInput ref={ref} {...props} />)

// ✅ ref as regular prop
function ComposerInput({ ref, ...props }) {
  return <TextInput ref={ref} {...props} />
}

// ❌ useContext
const value = useContext(MyContext)

// ✅ use() - can be called conditionally
const value = use(MyContext)
```
