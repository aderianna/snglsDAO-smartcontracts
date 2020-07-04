// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class CustomContributionReward extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save CustomContributionReward entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save CustomContributionReward entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("CustomContributionReward", id.toString(), this);
  }

  static load(id: string): CustomContributionReward | null {
    return store.get("CustomContributionReward", id) as CustomContributionReward | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get count(): BigInt {
    let value = this.get("count");
    return value.toBigInt();
  }

  set count(value: BigInt) {
    this.set("count", Value.fromBigInt(value));
  }

  get _avatar(): Bytes {
    let value = this.get("_avatar");
    return value.toBytes();
  }

  set _avatar(value: Bytes) {
    this.set("_avatar", Value.fromBytes(value));
  }

  get _proposalId(): Bytes {
    let value = this.get("_proposalId");
    return value.toBytes();
  }

  set _proposalId(value: Bytes) {
    this.set("_proposalId", Value.fromBytes(value));
  }
}