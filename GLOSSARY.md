# Paste to Callout

本仓库的术语表。插件的核心场景：把一段多段落的外部文章以 callout 形式插入 Obsidian 笔记，避免手动逐行补引用前缀。

## Language

**Callout**:
Obsidian 中由引用块扩展出的提示框，以 `> [!类型]` 行开头。
_Avoid_: 提示框、admonition

**Callout 类型**:
`[!...]` 中声明的标识符（如 `note`、`tip`），决定 callout 的图标与配色。
_Avoid_: callout 样式、kind

**Callout 标题**:
首行 `[!类型]` 之后、同行的标题文字；留空则省略。
_Avoid_: callout 名称

**引用前缀**:
行首的 `>`（或 `> `）标记；callout 内的每一行都必须携带它，否则该行会脱离 callout。
_Avoid_: 引用符号、quote mark

**粘贴对话框**:
插件提供的模态界面：文本域 + 类型下拉 + 可选标题输入，确认后以 callout 块形式插入笔记。
_Avoid_: 弹窗、modal

**预填**:
粘贴对话框打开时自动把系统剪贴板内容填入文本域的行为。
_Avoid_: 自动粘贴

**Callout 块**:
连续携带引用前缀的行构成的整块内容；是确认插入的最小产出单位。
_Avoid_: callout 段
