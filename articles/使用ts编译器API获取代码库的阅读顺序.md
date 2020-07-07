
一个朋友正在阅读vscode的源代码, 提出了这个问题. 对于不熟悉这个应用的代码的人来说, 怎么才能获取一个阅读文件的顺序呢? 

一般来说, 肯定是依赖少的文件排前面的, 而且依赖的文件不能比被依赖的文件排在阅读列表的前面.

首先想到的就是, 按依赖的多少排序, 那是不是直接按import和require语句的个数排序就可以了呢? 其实不行, 因为如果A依赖20个文件, 然后B依赖A, 则A的阅读顺序显然不能在B之前.

所以想到一个方法, 文件的依赖关系可以看成一个有向有环的图, 阅读顺序可以按一个文件到没有依赖的节点的最大深度来做(最小不行). 下面是实现.

其实, 这个实现同样适用于别的代码库, 只要是ts写的就行, 例如typescript本身的代码库.

改进的地方是, 对于依赖深度相同的, 可以按被依赖的次数排序, 这里没搞.

```tsx
import {
    createProgram,
    SourceFile,
    isImportDeclaration,
    createCompilerHost,
    CompilerOptions,
    ModuleKind,
    ModuleResolutionKind,
    ScriptTarget,
    resolveModuleNameFromCache,
    resolveModuleName,
} from "typescript"
import * as path from "path"
import { writeFileSync } from "fs"

const compilerOptions: CompilerOptions = {
    module: ModuleKind.AMD,
    moduleResolution: ModuleResolutionKind.NodeJs,
    experimentalDecorators: true,
    noImplicitReturns: true,
    noUnusedLocals: true,
    strict: true,
    forceConsistentCasingInFileNames: true,
    baseUrl: ".",
    paths: {
        "vs/*": ["./vs/*"],
    },
    lib: ["ES2015", "ES2017.String", "ES2018.Promise", "DOM", "DOM.Iterable", "WebWorker.ImportScripts"],
    allowJs: true,
    removeComments: false,
    preserveConstEnums: true,
    sourceMap: false,
    outDir: "../out/vs",
    target: ScriptTarget.ES2017,
    types: ["keytar", "mocha", "semver", "sinon", "winreg"],
}

const host = createCompilerHost(compilerOptions)

const cwd = process.cwd()

process.chdir("./vscode/src")

const entry = "vs/code/electron-main/main.ts"

const tscCwd = process.cwd()

const program = createProgram({
    rootNames: [entry],
    options: compilerOptions,
    host,
})

const map: Record<
    string,
    {
        references: string[]
        visited: boolean
        distance: number
    }
> = {}

function checkFile(sourceFile: SourceFile) {
    const references: string[] = []
    for (let statement of sourceFile.statements) {
        if (isImportDeclaration(statement)) {
            // console.log(statement.moduleSpecifier)
            const moduleSpecifier = statement.moduleSpecifier.getText(sourceFile).slice(1, -1)
            if (moduleSpecifier.startsWith("vs")) {
                const depModule = resolveModuleName(moduleSpecifier, sourceFile.fileName, compilerOptions, host)
                if (depModule.resolvedModule) {
                    let depModuleFileName = depModule.resolvedModule.resolvedFileName
                    references.push(depModuleFileName)
                }
            }
        }
    }
    let fileName = sourceFile.fileName
    if (fileName.startsWith(tscCwd)) {
        fileName = fileName.slice(tscCwd.length + 1)
    }
    map[fileName] = {
        references,
        visited: false,
        distance: references.length === 0 ? 0 : -Infinity,
    }
}

const sourceFiles = program.getSourceFiles().filter(sourceFile => {
    return !sourceFile.fileName.includes("/node_modules/")
})

console.log(`一共有${sourceFiles.length}个源文件`)

sourceFiles.forEach(checkFile)

function markDistance(file: string) {
    if (!map[file]) {
        return 0
    }
    if (map[file].visited) {
        return -Infinity
    }
    if (map[file].distance === -Infinity) {
        map[file].visited = true
        let maxDistance = Math.max(...map[file].references.map(markDistance))
        if (maxDistance === -Infinity) {
            maxDistance = -1
        }
        map[file].distance = maxDistance + 1
    }
    return map[file].distance
}

markDistance(entry)

const readList = {}

for (let filename in map) {
    const distance = map[filename].distance
    readList[distance] = readList[distance] || []
    readList[distance].push(filename)
}

writeFileSync(path.join(cwd, "readlist.json"), JSON.stringify(readList, null, "\t"))
```

结果如下, 可见入口文件确实是依赖深度最长的文件.
```json
{
	"0": [
		"vs/base/common/platform.ts",
		"vs/base/common/charCode.ts",
		"vs/base/common/assert.ts",
		"vs/nls.d.ts",
		"vs/base/common/errors.ts",
		"vs/base/common/functional.ts",
		"vs/base/common/iterator.ts",
		"vs/base/common/linkedList.ts",
		"vs/base/common/cancellation.ts",
		"vs/base/common/jsonSchema.ts",
		"vs/base/common/uint.ts",
		"vs/platform/instantiation/common/descriptors.ts",
		"vs/platform/instantiation/common/instantiation.ts",
		"vs/base/common/collections.ts",
		"vs/base/common/amd.ts",
		"vs/base/common/sequence.ts",
		"vs/base/common/stream.ts",
		"vs/platform/environment/node/waitMarkerFile.ts",
		"vs/base/common/uuid.ts",
		"vs/base/common/normalization.ts",
		"vs/base/common/marshalling.ts",
		"vs/base/common/objects.ts",
		"vs/base/common/json.ts",
		"vs/base/common/jsonFormatter.ts",
		"vs/base/common/jsonEdit.ts",
		"vs/platform/remote/common/remoteHosts.ts",
		"vs/base/common/performance.d.ts",
		"vs/base/common/actions.ts",
		"vs/base/node/paths.ts",
		"vs/base/common/decorators.ts",
		"vs/platform/backup/node/backup.ts",
		"vs/base/common/severity.ts",
		"vs/platform/telemetry/common/gdprTypings.ts",
		"vs/platform/launch/common/launch.ts",
		"vs/platform/instantiation/common/graph.ts",
		"vs/platform/state/node/stateService.ts",
		"vs/base/parts/request/common/request.ts",
		"vs/platform/request/node/proxy.ts",
		"vs/platform/extensionManagement/common/extensionManagementUtil.ts",
		"vs/base/parts/storage/common/storage.ts",
		"vs/platform/windows/electron-main/windowsStateStorage.ts",
		"vs/platform/update/electron-main/updateIpc.ts",
		"vs/base/parts/ipc/common/ipc.electron.ts",
		"vs/platform/url/common/urlIpc.ts",
		"vs/platform/telemetry/node/telemetryIpc.ts",
		"vs/base/parts/sandbox/common/electronTypes.ts",
		"vs/platform/workspaces/electron-main/workspacesService.ts",
		"vs/platform/update/electron-main/abstractUpdateService.ts",
		"vs/platform/update/electron-main/updateService.linux.ts",
		"vs/platform/issue/common/issue.ts",
		"vs/base/node/ps.ts",
		"vs/base/common/scanCode.ts",
		"vs/platform/menubar/common/menubar.ts",
		"vs/base/parts/contextmenu/common/contextmenu.ts",
		"vs/platform/update/electron-main/updateService.snap.ts",
		"vs/platform/url/common/urlService.ts",
		"vs/platform/diagnostics/node/diagnosticsIpc.ts",
		"vs/base/common/console.ts",
		"vs/platform/webview/common/webviewPortMapping.ts",
		"vs/base/common/mime.ts",
		"vs/platform/webview/electron-main/webviewProtocolProvider.ts",
		"vs/platform/log/node/spdlogService.ts",
		"vs/platform/log/common/bufferLog.ts",
		"vs/platform/sign/node/signService.ts",
		"vs/platform/files/node/watcher/unix/watcher.ts",
		"vs/platform/files/node/watcher/unix/watcherIpc.ts",
		"vs/platform/files/node/watcher/win32/csharpWatcherService.ts",
		"vs/platform/files/node/watcher/nsfw/watcher.ts",
		"vs/platform/files/node/watcher/nsfw/watcherIpc.ts",
		"vs/base/node/extpath.ts",
		"vs/base/node/ports.ts",
		"vs/platform/remote/node/nodeSocketFactory.ts"
	],
	"1": [
		"vs/base/common/process.ts",
		"vs/base/common/lifecycle.ts",
		"vs/platform/jsonschemas/common/jsonContributionRegistry.ts",
		"vs/base/common/strings.ts",
		"vs/platform/instantiation/common/serviceCollection.ts",
		"vs/platform/localizations/common/localizations.ts",
		"vs/base/common/network.ts",
		"vs/platform/product/common/productService.ts",
		"vs/base/common/arrays.ts",
		"vs/base/common/extpath.ts",
		"vs/base/common/async.ts",
		"vs/base/common/resources.ts",
		"vs/base/common/buffer.ts",
		"vs/platform/environment/node/argv.ts",
		"vs/base/node/pfs.ts",
		"vs/code/node/paths.ts",
		"vs/platform/environment/common/environment.ts",
		"vs/base/parts/ipc/common/ipc.ts",
		"vs/base/common/errorMessage.ts",
		"vs/platform/state/node/state.ts",
		"vs/base/common/labels.ts",
		"vs/base/common/color.ts",
		"vs/platform/theme/common/colorRegistry.ts",
		"vs/platform/windows/node/window.ts",
		"vs/base/common/keyCodes.ts",
		"vs/platform/commands/common/commands.ts",
		"vs/platform/contextkey/common/contextkey.ts",
		"vs/platform/lifecycle/common/lifecycle.ts",
		"vs/base/parts/ipc/common/ipc.net.ts",
		"vs/platform/url/common/url.ts",
		"vs/base/common/date.ts",
		"vs/platform/backup/electron-main/backup.ts",
		"vs/platform/telemetry/common/telemetry.ts",
		"vs/base/common/processes.ts",
		"vs/platform/configuration/common/configurationModels.ts",
		"vs/platform/request/common/request.ts",
		"vs/platform/request/node/requestService.ts",
		"vs/base/common/paging.ts",
		"vs/platform/extensions/common/extensionValidator.ts",
		"vs/platform/storage/common/storage.ts",
		"vs/platform/serviceMachineId/common/serviceMachineId.ts",
		"vs/platform/theme/electron-main/themeMainService.ts",
		"vs/base/parts/storage/node/storage.ts",
		"vs/platform/label/common/label.ts",
		"vs/code/node/shellEnv.ts",
		"vs/platform/update/common/update.ts",
		"vs/base/parts/ipc/electron-main/ipc.electron-main.ts",
		"vs/platform/ipc/electron-main/sharedProcessMainService.ts",
		"vs/platform/telemetry/common/telemetryUtils.ts",
		"vs/platform/telemetry/common/telemetryService.ts",
		"vs/platform/telemetry/node/commonProperties.ts",
		"vs/code/electron-main/auth.ts",
		"vs/platform/electron/common/electron.ts",
		"vs/base/node/macAddress.ts",
		"vs/base/node/crypto.ts",
		"vs/platform/update/electron-main/updateService.darwin.ts",
		"vs/platform/diagnostics/node/diagnosticsService.ts",
		"vs/platform/url/electron-main/electronUrlListener.ts",
		"vs/platform/driver/common/driver.ts",
		"vs/base/common/keybindingLabels.ts",
		"vs/base/common/keybindingParser.ts",
		"vs/platform/menubar/electron-main/menubar.ts",
		"vs/base/parts/contextmenu/electron-main/contextmenu.ts",
		"vs/platform/storage/node/storageIpc.ts",
		"vs/platform/backup/electron-main/backupMainService.ts",
		"vs/platform/debug/common/extensionHostDebug.ts",
		"vs/platform/userDataSync/common/storageKeys.ts",
		"vs/platform/userDataSync/common/userDataSync.ts",
		"vs/platform/userDataSync/common/userDataSyncMachines.ts",
		"vs/platform/userDataSync/common/userDataSyncAccount.ts",
		"vs/platform/remote/common/remoteAgentEnvironment.ts",
		"vs/platform/remote/common/remoteAuthorityResolver.ts",
		"vs/platform/sign/common/sign.ts",
		"vs/platform/webview/common/webviewManagerService.ts",
		"vs/platform/webview/common/mimeTypes.ts",
		"vs/platform/files/common/io.ts",
		"vs/platform/files/node/watcher/watcher.ts",
		"vs/base/node/decoder.ts",
		"vs/platform/files/node/watcher/win32/watcherService.ts",
		"vs/platform/files/node/watcher/nsfw/watcherService.ts",
		"vs/base/node/watcher.ts",
		"vs/platform/remote/node/tunnelService.ts"
	],
	"2": [
		"vs/base/common/path.ts",
		"vs/base/common/event.ts",
		"vs/platform/extensions/common/extensions.ts",
		"vs/base/common/map.ts",
		"vs/platform/product/common/product.ts",
		"vs/base/common/glob.ts",
		"vs/platform/log/common/logIpc.ts",
		"vs/platform/workspaces/common/workspaces.ts",
		"vs/platform/theme/common/themeService.ts",
		"vs/platform/keybinding/common/keybindingsRegistry.ts",
		"vs/base/parts/ipc/node/ipc.net.ts",
		"vs/platform/environment/node/environmentService.ts",
		"vs/platform/dialogs/common/dialogs.ts",
		"vs/platform/diagnostics/common/diagnostics.ts",
		"vs/platform/instantiation/common/instantiationService.ts",
		"vs/platform/configuration/common/configurationService.ts",
		"vs/platform/request/electron-main/requestMainService.ts",
		"vs/platform/extensionManagement/common/extensionManagement.ts",
		"vs/platform/storage/node/storageMainService.ts",
		"vs/platform/workspaces/electron-main/workspacesHistoryMainService.ts",
		"vs/code/electron-main/sharedProcess.ts",
		"vs/platform/electron/electron-main/electronMainService.ts",
		"vs/base/node/id.ts",
		"vs/platform/update/electron-main/updateService.win32.ts",
		"vs/platform/issue/electron-main/issueMainService.ts",
		"vs/platform/driver/node/driver.ts",
		"vs/platform/keybinding/common/baseResolvedKeybinding.ts",
		"vs/platform/menubar/electron-main/menubarMainService.ts",
		"vs/platform/debug/common/extensionHostDebugIpc.ts",
		"vs/platform/userDataSync/common/userDataSyncIpc.ts",
		"vs/platform/remote/common/remoteAgentConnection.ts",
		"vs/platform/webview/common/resourceLoader.ts",
		"vs/platform/files/common/fileService.ts",
		"vs/base/node/processes.ts",
		"vs/platform/files/node/watcher/nodejs/watcherService.ts"
	],
	"3": [
		"vs/base/common/uri.ts",
		"vs/platform/configuration/common/configurationRegistry.ts",
		"vs/platform/files/common/files.ts",
		"vs/platform/log/common/log.ts",
		"vs/platform/workspace/common/workspace.ts",
		"vs/platform/actions/common/actions.ts",
		"vs/platform/dialogs/electron-main/dialogs.ts",
		"vs/platform/extensionManagement/common/extensionGalleryService.ts",
		"vs/platform/windows/electron-main/windowTracker.ts",
		"vs/platform/keybinding/common/usLayoutResolvedKeybinding.ts",
		"vs/platform/remote/common/tunnel.ts",
		"vs/platform/webview/electron-main/webviewPortMappingProvider.ts",
		"vs/base/parts/ipc/node/ipc.cp.ts"
	],
	"4": [
		"vs/base/common/types.ts",
		"vs/platform/environment/node/argvHelper.ts",
		"vs/platform/configuration/common/configuration.ts",
		"vs/platform/workspaces/electron-main/workspacesMainService.ts",
		"vs/code/electron-main/window.ts",
		"vs/platform/driver/electron-main/driver.ts",
		"vs/platform/webview/electron-main/webviewMainService.ts",
		"vs/platform/files/node/watcher/unix/watcherService.ts"
	],
	"5": [
		"vs/platform/registry/common/platform.ts",
		"vs/platform/windows/common/windows.ts",
		"vs/platform/launch/electron-main/launchMainService.ts",
		"vs/platform/windows/electron-main/windowsMainService.ts",
		"vs/platform/files/node/diskFileSystemProvider.ts"
	],
	"6": [
		"vs/platform/update/common/update.config.contribution.ts",
		"vs/platform/windows/electron-main/windows.ts",
		"vs/code/electron-main/app.ts"
	],
	"7": [
		"vs/platform/lifecycle/electron-main/lifecycleMainService.ts"
	],
	"8": [
		"vs/code/electron-main/main.ts"
	]
}
```