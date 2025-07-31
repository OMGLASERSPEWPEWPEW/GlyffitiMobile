# ADR-001: Storage Service Consolidation

**File:** `docs/adr/001-storage-service-consolidation.md`  
**Path:** `docs/adr/001-storage-service-consolidation.md`

## Status
**Accepted** - Implementation in progress

## Context
The application currently has multiple storage services (`MobileStorageManager`, `MobileScrollManager`) that handle different aspects of content storage. This creates:

- **Duplication**: Similar storage patterns repeated across services
- **Complexity**: Multiple imports and service calls throughout the codebase
- **Maintenance burden**: Changes require updates to multiple services
- **Testing overhead**: Each service needs separate testing and validation

As the application grows to support multiple content formats (stories → videos → music), we need a unified storage abstraction that can scale efficiently.

## Decision
We will consolidate all storage operations into a single `StorageService` facade that coordinates between specialized storage modules.

### Architecture
```
StorageService (Facade)
├── InProgressStorage (Content being created/published)
├── PublishedStorage (Successfully published content)
└── ScrollStorage (Content metadata and scroll manifests)
```

### Key Principles
1. **Single Responsibility**: Each specialized service handles one storage domain
2. **Facade Pattern**: StorageService provides unified interface
3. **Backwards Compatibility**: Maintain existing method signatures during migration
4. **Testability**: Each service includes self-test capabilities

## Consequences

### Positive
- **Simplified Imports**: Single import for all storage operations
- **Consistent API**: Unified interface across the application
- **Better Testing**: Centralized service easier to test and mock
- **Scalability**: Easy to add new storage types (e.g., media metadata)
- **Maintenance**: Single point of change for storage logic

### Negative
- **Migration Effort**: Requires updating imports across 15+ files
- **Learning Curve**: Developers need to understand new service structure
- **Risk**: Consolidation could introduce regressions if not carefully tested

### Neutral
- **File Structure**: Moves from flat services to organized subdirectories
- **Method Names**: Keep existing names for seamless migration

## Implementation Plan

### Phase 1: Create New Architecture (✅ Complete)
- ✅ Create `StorageService` facade
- ✅ Create specialized storage services
- ✅ Implement all existing methods
- ✅ Add comprehensive testing

### Phase 2: Migrate Imports (✅ In Progress)
- 🔄 Update service imports in all files
- ⏳ Update method calls to use StorageService
- ⏳ Test each screen/feature after migration
- ⏳ Remove old service files

### Phase 3: Cleanup and Optimization
- ⏳ Move deprecated files to `___deprecated/` folder
- ⏳ Add any missing functionality
- ⏳ Performance optimization
- ⏳ Documentation updates

## Alternatives Considered

### Option 1: Keep Separate Services
**Rejected** - Would continue current problems and not scale for multi-format content

### Option 2: Single Monolithic Service
**Rejected** - Would violate single responsibility principle and become unwieldy

### Option 3: Event-Driven Storage
**Deferred** - More complex than needed for current requirements, consider for future

```

### Testing Strategy
1. Update imports file by file
2. Test affected screens after each change
3. Use service self-tests to verify functionality
4. Run integration tests before removing old files

## Success Metrics
- [ ] All imports successfully migrated
- [ ] All existing functionality preserved
- [ ] Performance maintained or improved
- [ ] Test coverage for new architecture
- [ ] Zero regressions in app functionality

## Related Decisions
- **ADR-002**: Compression Strategy (uses StorageService)
- **ADR-003**: Multi-format Content Support (enabled by unified storage)

## References
- [Facade Pattern](https://refactoring.guru/design-patterns/facade)
- [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- [React Native AsyncStorage Best Practices](https://reactnative.dev/docs/asyncstorage)

---

**Character count: 3,847**