package com.kiskadee.android.schema

import org.json.JSONArray
import org.json.JSONObject

public sealed interface KiskadeeJsonValue {
    public data class StringValue(val value: String) : KiskadeeJsonValue
    public data class NumberValue(val value: Double) : KiskadeeJsonValue
    public data class BoolValue(val value: Boolean) : KiskadeeJsonValue
    public data class ArrayValue(val value: List<KiskadeeJsonValue>) : KiskadeeJsonValue
    public data class ObjectValue(val value: Map<String, KiskadeeJsonValue>) : KiskadeeJsonValue
    public data object NullValue : KiskadeeJsonValue
}

internal val KiskadeeJsonValue.numberValue: Double?
    get() = (this as? KiskadeeJsonValue.NumberValue)?.value

internal val KiskadeeJsonValue.objectValue: Map<String, KiskadeeJsonValue>?
    get() = (this as? KiskadeeJsonValue.ObjectValue)?.value

internal fun jsonValueFrom(rawValue: Any?): KiskadeeJsonValue {
    return when (rawValue) {
        null, JSONObject.NULL -> KiskadeeJsonValue.NullValue
        is Boolean -> KiskadeeJsonValue.BoolValue(rawValue)
        is Number -> KiskadeeJsonValue.NumberValue(rawValue.toDouble())
        is String -> KiskadeeJsonValue.StringValue(rawValue)
        is JSONArray -> KiskadeeJsonValue.ArrayValue(rawValue.toList(::jsonValueFrom))
        is JSONObject -> KiskadeeJsonValue.ObjectValue(rawValue.toMap { _, value -> jsonValueFrom(value) })
        else -> throw KiskadeeSchemaException("Unsupported Kiskadee JSON value '$rawValue'.")
    }
}

internal fun JSONObject.keyList(): List<String> {
    val keys = keys()
    val values = mutableListOf<String>()

    while (keys.hasNext()) {
        values += keys.next()
    }

    return values
}

internal fun <T> JSONObject.toMap(transform: (key: String, value: Any?) -> T): Map<String, T> {
    return keyList().associateWith { key -> transform(key, opt(key)) }
}

internal fun <T> JSONArray.toList(transform: (value: Any?) -> T): List<T> {
    return List(length()) { index -> transform(opt(index)) }
}
